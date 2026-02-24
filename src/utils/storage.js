/**
 * localStorage 持久化工具 - 统一存储键
 */
const STORAGE_KEY = 'liaotiao_chat_data'

export function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.warn('Load from localStorage failed:', e)
    return null
  }
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Save to localStorage failed:', e)
  }
}
