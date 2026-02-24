const BASE_URL = "https://xuqing.pythonanywhere.com"

let currentUser = null

export function setCurrentUser(username) {
  currentUser = username
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...(currentUser ? { "X-User": currentUser } : {})
  }
}

// 注册
export async function register(username, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  return res.json()
}

// 登录
export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })

  const data = await res.json()

  if (data.success) {
    setCurrentUser(username)   // 🔥 关键
  }

  return data
}

// 添加好友
export async function addFriend(username) {
  const res = await fetch(`${BASE_URL}/add_friend`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username })
  })
  return res.json()
}

// 获取好友列表
export async function getFriends() {
  const res = await fetch(`${BASE_URL}/friends`, {
    method: "GET",
    headers: getHeaders()
  })
  return res.json()
}

// 发送消息
export async function sendMessage(to_user_id, content) {
  const res = await fetch(`${BASE_URL}/send`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ to_user_id, content })
  })
  return res.json()
}

// 获取聊天记录
export async function getMessages(other_id) {
  const res = await fetch(
    `${BASE_URL}/messages?other_id=${other_id}`,
    {
      method: "GET",
      headers: getHeaders()
    }
  )
  return res.json()
}