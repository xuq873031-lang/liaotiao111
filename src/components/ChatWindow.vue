<template>
  <div class="chat-window">
    <div v-if="!chatId" class="chat-empty">
      <p>请从左侧选择一个会话，或从好友/群聊页面进入</p>
    </div>

    <template v-else>
      <!-- 聊天头部 + 搜索 -->
      <header class="chat-header">
        <h3>{{ chatName }}</h3>
        <span class="chat-type-tag">{{ chatType === 'private' ? '单聊' : '群聊' }}</span>
        <div class="header-search">
          <SearchBar
            ref="searchBarRef"
            v-model="searchKeyword"
            :placeholder="searchMode === 'current' ? '搜索当前会话' : '全局搜索'"
            :show-count="true"
            :match-count="searchResults.length"
            @enter="goToNextSearchResult"
          />
          <button
            class="btn-mode"
            :title="searchMode === 'current' ? '当前会话' : '全局'"
            @click="toggleSearchMode"
          >
            {{ searchMode === 'current' ? '当前' : '全部' }}
          </button>
        </div>
      </header>

      <!-- 消息列表 -->
      <div class="message-list" ref="messageListRef" @scroll="onScroll">
        <div
          v-for="(msg, idx) in displayMessages"
          :key="msg.id"
          :ref="(el) => setMessageRef(msg.id, el)"
          class="message-wrapper"
        >
          <MessageItem
            :msg="msg"
            :is-self="msg.senderId === currentUserId"
            :sender-name="getUserName(msg.senderId)"
            :show-sender-name="chatType === 'group' && msg.senderId !== currentUserId"
            :highlight-keyword="searchKeyword"
            :allow-edit-time="true"
            @recall="handleRecall"
            @delete="handleDelete"
            @edit-time="openEditTime"
            @preview-image="previewImageSrc = $event"
          />
        </div>
      </div>

      <!-- 发送区域 -->
      <div class="send-area" ref="sendAreaRef">
        <div class="send-toolbar">
          <button class="btn-icon" title="表情" @click="emojiVisible = !emojiVisible">😊</button>
          <label class="btn-icon btn-upload">
            <span title="图片">🖼</span>
            <input
              type="file"
              accept="image/*"
              @change="handleImageSelect"
            />
          </label>
        </div>
        <div class="send-input-wrap">
          <textarea
            ref="inputRef"
            v-model="inputText"
            class="send-input"
            placeholder="输入消息，按回车发送"
            rows="3"
            @keydown.enter.exact.prevent="handleSend"
            @focus="emojiVisible = false"
          />
          <EmojiPanel
            v-if="emojiVisible"
            :visible="emojiVisible"
            @insert="insertEmoji"
            @close="emojiVisible = false"
          />
        </div>
        <div class="send-actions">
          <button class="btn btn-primary" @click="handleSend">发送</button>
        </div>
      </div>
    </template>

    <!-- 图片预览 -->
    <ImagePreview
      :visible="!!previewImageSrc"
      :src="previewImageSrc"
      @close="previewImageSrc = ''"
    />

    <!-- 修改时间弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <h4>修改消息时间（测试用）</h4>
        <input v-model="editTimeStr" type="datetime-local" class="input" step="1" />
        <div class="modal-actions">
          <button class="btn" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmEditTime">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useChatStore } from '../stores/chatStore'
import SearchBar from './SearchBar.vue'
import MessageItem from './MessageItem.vue'
import EmojiPanel from './EmojiPanel.vue'
import ImagePreview from './ImagePreview.vue'

const props = defineProps({
  chatId: { type: String, default: '' },
  chatType: { type: String, validator: (v) => ['private', 'group'].includes(v), default: 'private' },
  chatName: { type: String, default: '' }
})

const emit = defineEmits(['switchChat'])

const userStore = useUserStore()
const chatStore = useChatStore()

const currentUserId = computed(() => userStore.currentUserId)
const inputText = ref('')
const inputRef = ref(null)
const messageListRef = ref(null)
const sendAreaRef = ref(null)
const searchBarRef = ref(null)
const emojiVisible = ref(false)
const previewImageSrc = ref('')
const showEditModal = ref(false)
const editTargetMsg = ref(null)
const editTimeStr = ref('')
const searchKeyword = ref('')
const searchMode = ref('current') // 'current' | 'global'
const currentSearchIndex = ref(-1)
const messageRefsMap = ref({})

const IMAGE_MAX_WIDTH = 200

const messageList = computed(() => {
  if (!props.chatId) return []
  return chatStore.getMessagesByChatId(props.chatId)
})

const searchResults = computed(() => {
  const kw = searchKeyword.value?.trim()
  if (!kw) return []
  if (searchMode.value === 'current' && props.chatId) {
    return chatStore.searchMessages(kw, props.chatId, props.chatType)
  }
  return chatStore.searchMessages(kw)
})

const displayMessages = computed(() => messageList.value)

function setMessageRef(id, el) {
  if (el) messageRefsMap.value[id] = el
}

function getUserName(userId) {
  return userStore.getUserById(userId)?.name || userId
}

function handleSend() {
  const text = inputText.value?.trim()
  if (!text || !props.chatId) return
  chatStore.sendMessage(props.chatId, props.chatType, 'text', text)
  inputText.value = ''
  nextTick(() => scrollToBottom())
}

function insertEmoji(emoji) {
  if (inputRef.value) {
    const start = inputRef.value.selectionStart
    const end = inputRef.value.selectionEnd
    const before = inputText.value.substring(0, start)
    const after = inputText.value.substring(end)
    inputText.value = before + emoji + after
    nextTick(() => {
      inputRef.value.selectionStart = inputRef.value.selectionEnd = start + emoji.length
      inputRef.value.focus()
    })
  }
}

function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result
    resizeImage(base64, IMAGE_MAX_WIDTH).then((resized) => {
      chatStore.sendMessage(props.chatId, props.chatType, 'image', resized)
      nextTick(() => scrollToBottom())
    }).catch(() => {
      chatStore.sendMessage(props.chatId, props.chatType, 'image', base64)
      nextTick(() => scrollToBottom())
    })
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function resizeImage(src, maxWidth) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.width <= maxWidth) {
        resolve(src)
        return
      }
      const canvas = document.createElement('canvas')
      const scale = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * scale
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

function toggleSearchMode() {
  searchMode.value = searchMode.value === 'current' ? 'global' : 'current'
  currentSearchIndex.value = -1
}

function goToNextSearchResult() {
  const list = searchResults.value
  if (!list.length) return
  currentSearchIndex.value = (currentSearchIndex.value + 1) % list.length
  const msg = list[currentSearchIndex.value]
  if (msg.chatId !== props.chatId || msg.type !== props.chatType) {
    emit('switchChat', { chatId: msg.chatId, type: msg.type })
    nextTick(() => scrollToMessage(msg.id))
  } else {
    scrollToMessage(msg.id)
  }
}

function scrollToMessage(msgId) {
  nextTick(() => {
    const el = messageRefsMap.value[msgId]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

function onScroll() {}

function handleRecall(msg) {
  chatStore.recallMessage(msg.id)
}

function handleDelete(msg) {
  if (confirm('确定删除该消息？')) {
    chatStore.deleteMessage(msg.id)
  }
}

function openEditTime(msg) {
  editTargetMsg.value = msg
  const d = new Date(msg.time)
  editTimeStr.value = d.toISOString().slice(0, 19)
  showEditModal.value = true
}

function confirmEditTime() {
  if (!editTargetMsg.value || !editTimeStr.value) return
  chatStore.updateMessageTime(editTargetMsg.value.id, new Date(editTimeStr.value).getTime())
  showEditModal.value = false
  editTargetMsg.value = null
}

watch(
  () => [props.chatId, messageList.value.length],
  () => nextTick(scrollToBottom)
)
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-white);
}

.chat-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.chat-header h3 {
  font-size: 16px;
  font-weight: 500;
}

.chat-type-tag {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}

.header-search {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 120px;
  max-width: 240px;
}

.header-search :deep(.search-bar) {
  flex: 1;
}

.btn-mode {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  cursor: pointer;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message-wrapper {
  scroll-margin: 16px;
}

.send-area {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.send-toolbar {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--bg-secondary);
}

.btn-upload {
  cursor: pointer;
  margin: 0;
}

.btn-upload input {
  display: none;
}

.send-input-wrap {
  position: relative;
}

.send-input-wrap :deep(.emoji-panel-wrapper) {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
}

.send-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  outline: none;
}

.send-input:focus {
  border-color: var(--accent);
}

.send-actions {
  display: flex;
  justify-content: flex-end;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 320px;
}

.modal h4 {
  margin-bottom: 12px;
}

.modal input {
  width: 100%;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
