import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getNow } from '../utils/timeUtils'
import { generateId } from '../utils/id'
import { useUserStore } from './userStore'
import { useGroupStore } from './groupStore'

const STORAGE_KEY = 'liaotiao_chat'
const RECALL_LIMIT_MS = 2 * 60 * 1000

const defaultData = () => ({
  messages: [
    {
      id: 'm1',
      chatId: 'user1',
      type: 'private',
      senderId: 'user1',
      msgType: 'text',
      content: '你好呀！',
      time: Date.now() - 3600000
    },
    {
      id: 'm2',
      chatId: 'user1',
      type: 'private',
      senderId: 'me',
      msgType: 'text',
      content: '你好，在吗？',
      time: Date.now() - 3500000
    },
    {
      id: 'm3',
      chatId: 'group1',
      type: 'group',
      senderId: 'user1',
      msgType: 'text',
      content: '大家好啊',
      time: Date.now() - 7200000
    }
  ],
  unreadCounts: {}
})

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore()
  const groupStore = useGroupStore()

  const load = () => {
    try {
      const d = localStorage.getItem(STORAGE_KEY)
      if (!d) return null
      const data = JSON.parse(d)
      if (data.messages) {
        data.messages = data.messages.map((m) => ({
          ...m,
          msgType: m.msgType || 'text',
          isRecalled: m.isRecalled || false
        }))
      }
      return data
    } catch {
      return null
    }
  }
  const save = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Save chat failed:', e)
    }
  }

  const state = ref(load() || defaultData())

  watch(state, (val) => save(val), { deep: true })

  const messages = computed(() => state.value.messages)
  const unreadCounts = computed(() => state.value.unreadCounts || {})

  function getUnreadKey(chatId, type) {
    return `${type}_${chatId}`
  }

  function getUnreadCount(chatId, type) {
    return unreadCounts.value[getUnreadKey(chatId, type)] || 0
  }

  function setUnreadCount(chatId, type, count) {
    if (!state.value.unreadCounts) state.value.unreadCounts = {}
    const key = getUnreadKey(chatId, type)
    if (count <= 0) {
      delete state.value.unreadCounts[key]
    } else {
      state.value.unreadCounts[key] = count
    }
  }

  function clearUnread(chatId, type) {
    setUnreadCount(chatId, type, 0)
  }

  function incrementUnread(chatId, type) {
    const key = getUnreadKey(chatId, type)
    if (!state.value.unreadCounts) state.value.unreadCounts = {}
    state.value.unreadCounts[key] = (state.value.unreadCounts[key] || 0) + 1
  }

  function getMessagesByChatId(chatId) {
    return state.value.messages
      .filter((m) => m.chatId === chatId)
      .sort((a, b) => a.time - b.time)
  }

  const conversationList = computed(() => {
    const list = []
    const seen = new Set()
    const msgs = [...state.value.messages].sort((a, b) => b.time - a.time)

    for (const m of msgs) {
      if (seen.has(m.chatId + m.type)) continue
      seen.add(m.chatId + m.type)
      const type = m.type
      const chatId = m.chatId
      const lastMsg = m
      let name
      if (type === 'private') {
        name = userStore.getUserById(chatId)?.name || chatId
      } else {
        name = groupStore.getGroupById(chatId)?.name || chatId
      }
      const key = getUnreadKey(chatId, type)
      list.push({
        chatId,
        type,
        name,
        lastMessage: lastMsg,
        lastTime: lastMsg.time,
        unread: (state.value.unreadCounts || {})[key] || 0
      })
    }
    return list.sort((a, b) => b.lastTime - a.lastTime)
  })

  function sendMessage(chatId, type, msgType, content) {
    const msg = {
      id: 'msg_' + generateId(),
      chatId,
      type,
      senderId: userStore.currentUserId,
      msgType: msgType || 'text',
      content: content || '',
      time: getNow().getTime(),
      isRecalled: false
    }
    state.value.messages.push(msg)
    return msg
  }

  function deleteMessage(messageId) {
    state.value.messages = state.value.messages.filter((m) => m.id !== messageId)
  }

  function recallMessage(messageId) {
    const msg = state.value.messages.find((m) => m.id === messageId)
    if (!msg) return false
    if (msg.senderId !== userStore.currentUserId) return false
    const now = getNow().getTime()
    if (now - msg.time > RECALL_LIMIT_MS) return false
    msg.isRecalled = true
    msg.content = '[消息已撤回]'
    msg.msgType = 'text'
    return true
  }

  function updateMessageTime(messageId, newTime) {
    const msg = state.value.messages.find((m) => m.id === messageId)
    if (msg) {
      msg.time = typeof newTime === 'number' ? newTime : new Date(newTime).getTime()
    }
  }

  function searchMessages(keyword, chatId = null, type = null) {
    const kw = (keyword || '').trim().toLowerCase()
    if (!kw) return []
    let list = state.value.messages.filter((m) => {
      if (m.isRecalled || m.msgType === 'image') return false
      if (!m.content || typeof m.content !== 'string') return false
      return m.content.toLowerCase().includes(kw)
    })
    if (chatId && type) {
      list = list.filter((m) => m.chatId === chatId && m.type === type)
    }
    return list.sort((a, b) => a.time - b.time)
  }

  return {
    state,
    messages,
    unreadCounts,
    conversationList,
    getUnreadCount,
    setUnreadCount,
    clearUnread,
    incrementUnread,
    getMessagesByChatId,
    sendMessage,
    deleteMessage,
    recallMessage,
    updateMessageTime,
    searchMessages
  }
})
