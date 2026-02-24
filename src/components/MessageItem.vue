<template>
  <div
    class="message-item"
    :class="{ 'is-self': isSelf }"
    @contextmenu.prevent="showMenu($event)"
  >
    <div class="message-content">
      <div v-if="showSenderName" class="message-sender">{{ senderName }}:</div>
      <div class="message-bubble">
        <!-- 文本消息 -->
        <span v-if="msg.msgType === 'text'" v-html="renderedContent"></span>
        <!-- 图片消息 -->
        <img
          v-else-if="msg.msgType === 'image' && !msg.isRecalled"
          :src="msg.content"
          class="msg-image"
          loading="lazy"
          @click="previewImage(msg.content)"
        />
      </div>
      <div class="message-meta">
        <span class="message-time">{{ formatTime(msg.time, 'short') }}</span>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="menuVisible"
      class="context-menu"
      :style="{ top: menuY + 'px', left: menuX + 'px' }"
      @click.stop
    >
      <button v-if="canRecall" @click="recall">撤回</button>
      <button @click="deleteMsg">删除</button>
      <button v-if="allowEditTime" @click="editTime">修改时间</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatTime } from '../utils/timeUtils'
import { getNow } from '../utils/timeUtils'

const props = defineProps({
  msg: { type: Object, required: true },
  isSelf: Boolean,
  senderName: { type: String, default: '' },
  showSenderName: Boolean,
  highlightKeyword: { type: String, default: '' },
  allowEditTime: { type: Boolean, default: false }
})

const emit = defineEmits(['recall', 'delete', 'editTime', 'previewImage'])

const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)

const RECALL_LIMIT_MS = 2 * 60 * 1000

const canRecall = computed(() => {
  if (!props.isSelf || props.msg.isRecalled) return false
  const now = getNow().getTime()
  return now - props.msg.time <= RECALL_LIMIT_MS
})

const renderedContent = computed(() => {
  if (props.msg.isRecalled) return '[消息已撤回]'
  const text = escapeHtml(props.msg.content || '')
  if (!props.highlightKeyword) return text
  const kw = escapeRegExp(props.highlightKeyword)
  const re = new RegExp(`(${kw})`, 'gi')
  return text.replace(re, '<mark>$1</mark>')
})

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function showMenu(e) {
  menuX.value = e.clientX
  menuY.value = e.clientY
  menuVisible.value = true
  const close = () => {
    menuVisible.value = false
    document.removeEventListener('click', close)
  }
  setTimeout(() => document.addEventListener('click', close), 0)
}

function recall() {
  emit('recall', props.msg)
  menuVisible.value = false
}

function deleteMsg() {
  emit('delete', props.msg)
  menuVisible.value = false
}

function editTime() {
  emit('editTime', props.msg)
  menuVisible.value = false
}

function previewImage(src) {
  if (props.msg.msgType === 'image' && src) emit('previewImage', src)
}
</script>

<style scoped>
.message-item {
  margin-bottom: 12px;
}

.message-item.is-self {
  display: flex;
  justify-content: flex-end;
}

.message-item.is-self .message-bubble {
  background: var(--msg-self);
}

.message-content {
  max-width: 70%;
  display: inline-block;
  position: relative;
}

.message-item.is-self .message-content {
  text-align: right;
}

.message-sender {
  font-size: 12px;
  color: var(--accent);
  margin-bottom: 2px;
}

.message-bubble {
  display: inline-block;
  padding: 8px 12px;
  background: var(--msg-other);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-bubble :deep(mark) {
  background: #ffeb3b;
  padding: 0 2px;
  border-radius: 2px;
}

.msg-image {
  max-width: 200px;
  max-height: 200px;
  display: block;
  border-radius: 4px;
  cursor: pointer;
}

.message-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 999;
  min-width: 100px;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.context-menu button:hover {
  background: var(--bg-secondary);
}
</style>
