<template>
  <div class="conversation-list">
    <div
      v-for="conv in sortedList"
      :key="conv.chatId + conv.type"
      class="conversation-item"
      :class="{ active: isActive(conv) }"
      @click="select(conv)"
    >
      <div class="conv-avatar">{{ conv.name.charAt(0) }}</div>
      <div class="conv-info">
        <span class="conv-name">{{ conv.name }}</span>
        <span class="conv-preview">{{ getPreview(conv) }}</span>
      </div>
      <div class="conv-right">
        <span class="conv-time">{{ formatTime(conv.lastTime, 'relative') }}</span>
        <span v-if="conv.unread" class="conv-unread">{{ conv.unread > 99 ? '99+' : conv.unread }}</span>
      </div>
    </div>
    <div v-if="!sortedList.length" class="empty-hint">暂无会话</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime } from '../utils/timeUtils'

const props = defineProps({
  list: { type: Array, default: () => [] },
  activeChatId: { type: String, default: '' },
  activeChatType: { type: String, default: 'private' },
  getUserName: { type: Function, default: () => '' },
  currentUserId: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const sortedList = computed(() => {
  return [...props.list].sort((a, b) => b.lastTime - a.lastTime)
})

function isActive(conv) {
  return conv.chatId === props.activeChatId && conv.type === props.activeChatType
}

function getPreview(conv) {
  const msg = conv.lastMessage
  if (!msg) return ''
  if (msg.isRecalled) return '[消息已撤回]'
  if (msg.msgType === 'image') return '[图片]'
  const sender = msg.senderId === props.currentUserId ? '我' : props.getUserName(msg.senderId)
  const prefix = conv.type === 'group' && sender ? `${sender}: ` : ''
  return prefix + (msg.content || '[消息]')
}

function select(conv) {
  emit('select', conv)
}
</script>

<style scoped>
.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.conversation-item:hover {
  background: var(--bg-secondary);
}

.conversation-item.active {
  background: var(--bg-secondary);
}

.conv-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  display: block;
  font-weight: 500;
  margin-bottom: 2px;
}

.conv-preview {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.conv-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.conv-unread {
  background: #fa5151;
  color: white;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.empty-hint {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
