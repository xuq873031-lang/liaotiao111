<template>
  <div class="chat-page">
    <!-- 左侧 240px 固定 -->
    <aside class="conversation-sidebar">
      <h2 class="sidebar-title">会话</h2>

      <!-- 时间模拟面板 -->
      <div class="time-panel">
        <div class="time-display">{{ formatTime(simulatedTime, 'full') }}</div>
        <div class="time-actions">
          <button class="btn-sm" @click="offsetTime(-1)">-1h</button>
          <button class="btn-sm" @click="resetTime">重置</button>
          <button class="btn-sm" @click="offsetTime(1)">+1h</button>
        </div>
      </div>

      <ConversationList
        :list="conversationList"
        :active-chat-id="activeChatId"
        :active-chat-type="activeChatType"
        :get-user-name="(id) => userStore.getUserById(id)?.name"
        :current-user-id="userStore.currentUserId"
        @select="selectConversation"
      />
    </aside>

    <!-- 右侧聊天区域 -->
    <section class="chat-main">
      <ChatWindow
        :chat-id="activeChatId"
        :chat-type="activeChatType"
        :chat-name="activeChatName"
        @switch-chat="handleSwitchChat"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useGroupStore } from '../stores/groupStore'
import { useChatStore } from '../stores/chatStore'
import { formatTime, getNow, offsetByHours, resetTimeOffset } from '../utils/timeUtils'
import ConversationList from '../components/ConversationList.vue'
import ChatWindow from '../components/ChatWindow.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const groupStore = useGroupStore()
const chatStore = useChatStore()

const activeChatId = ref('')
const activeChatType = ref('private')
const timeTrigger = ref(0)

const simulatedTime = computed(() => {
  timeTrigger.value // 依赖，使时间变化时重算
  return getNow()
})

function offsetTime(hours) {
  offsetByHours(hours)
  timeTrigger.value++
}

function resetTime() {
  resetTimeOffset()
  timeTrigger.value++
}

const conversationList = computed(() => {
  const list = [...chatStore.conversationList]
  if (activeChatId.value && activeChatType.value) {
    const exists = list.some(
      (c) => c.chatId === activeChatId.value && c.type === activeChatType.value
    )
    if (!exists) {
      let name = ''
      if (activeChatType.value === 'private') {
        name = userStore.getUserById(activeChatId.value)?.name || activeChatId.value
      } else {
        name = groupStore.getGroupById(activeChatId.value)?.name || activeChatId.value
      }
      list.unshift({
        chatId: activeChatId.value,
        type: activeChatType.value,
        name,
        lastMessage: null,
        lastTime: 0,
        unread: 0
      })
    }
  }
  return list
})

const activeChatName = computed(() => {
  if (!activeChatId.value) return ''
  if (activeChatType.value === 'private') {
    return userStore.getUserById(activeChatId.value)?.name || activeChatId.value
  }
  return groupStore.getGroupById(activeChatId.value)?.name || activeChatId.value
})

function selectConversation(conv) {
  activeChatId.value = conv.chatId
  activeChatType.value = conv.type
  chatStore.clearUnread(conv.chatId, conv.type)
  router.replace({ path: '/chat', query: { id: conv.chatId, type: conv.type } })
}

function handleSwitchChat({ chatId, type }) {
  activeChatId.value = chatId
  activeChatType.value = type
  chatStore.clearUnread(chatId, type)
  router.replace({ path: '/chat', query: { id: chatId, type } })
}

watch(
  () => route.query,
  (query) => {
    if (query.id && query.type) {
      activeChatId.value = query.id
      activeChatType.value = query.type
      chatStore.clearUnread(query.id, query.type)
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100%;
  background: var(--bg-white);
}

.conversation-sidebar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
}

.sidebar-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
}

.time-panel {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.time-display {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  word-break: break-all;
}

.time-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  flex: 1;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.btn-sm:hover {
  background: var(--bg-secondary);
}

.chat-main {
  flex: 1;
  min-width: 0;
}
</style>
