import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useUserStore } from './userStore'
import { generateId } from '../utils/id'

const STORAGE_KEY = 'liaotiao_groups'
const defaultData = () => [
  { id: 'group1', name: '前端交流群', members: ['me', 'user1', 'user2'] },
  { id: 'group2', name: '吃鸡小队', members: ['me', 'user2', 'user3'] }
]

export const useGroupStore = defineStore('group', () => {
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
      console.warn('Save groups failed:', e)
    }
  }

  const groups = ref(load() || defaultData())

  watch(groups, (val) => save(val), { deep: true })

  function createGroup(name, memberIds = []) {
    const trimmed = name?.trim()
    if (!trimmed) return null
    const group = {
      id: 'group_' + generateId(),
      name: trimmed,
      members: ['me', ...memberIds.filter((id) => id !== 'me')]
    }
    groups.value.push(group)
    return group
  }

  function addMemberToGroup(groupId, userId) {
    const group = groups.value.find((g) => g.id === groupId)
    if (!group || group.members.includes(userId)) return false
    group.members.push(userId)
    return true
  }

  function removeGroup(groupId) {
    groups.value = groups.value.filter((g) => g.id !== groupId)
  }

  function getGroupById(id) {
    return groups.value.find((g) => g.id === id)
  }

  return {
    groups,
    createGroup,
    addMemberToGroup,
    removeGroup,
    getGroupById
  }
})
