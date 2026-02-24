import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { generateId } from '../utils/id'

const STORAGE_KEY = 'liaotiao_users'
const defaultData = () => ({
  currentUserId: 'me',
  users: [
    { id: 'me', name: '我' },
    { id: 'user1', name: '张三' },
    { id: 'user2', name: '李四' },
    { id: 'user3', name: '王五' }
  ],
  friends: ['user1', 'user2', 'user3']
})

export const useUserStore = defineStore('user', () => {
  const load = () => {
    try {
      const d = localStorage.getItem(STORAGE_KEY)
      return d ? JSON.parse(d) : null
    } catch {
      return null
    }
  }
  const save = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Save users failed:', e)
    }
  }

  const state = ref(load() || defaultData())

  watch(state, (val) => save(val), { deep: true })

  const currentUserId = computed(() => state.value.currentUserId)
  const users = computed(() => state.value.users)
  const friends = computed(() => state.value.friends)

  const friendList = computed(() =>
    state.value.friends
      .map((id) => getUserById(id))
      .filter(Boolean)
  )

  function getUserById(id) {
    return state.value.users.find((u) => u.id === id)
  }

  function addFriend(name) {
    const trimmed = name?.trim()
    if (!trimmed) return null
    const existing = state.value.users.find((u) => u.name === trimmed && u.id !== 'me')
    if (existing) {
      if (state.value.friends.includes(existing.id)) return null
      state.value.friends.push(existing.id)
      return existing
    }
    const newUser = { id: 'user_' + generateId(), name: trimmed }
    state.value.users.push(newUser)
    state.value.friends.push(newUser.id)
    return newUser
  }

  function removeFriend(friendId) {
    state.value.friends = state.value.friends.filter((id) => id !== friendId)
  }

  return {
    state,
    currentUserId,
    users,
    friends,
    friendList,
    getUserById,
    addFriend,
    removeFriend
  }
})
