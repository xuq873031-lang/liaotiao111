<template>
  <div class="friends-page">
    <div class="page-header">
      <h2>好友</h2>
      <div class="add-friend">
        <input
          v-model="newFriendName"
          type="text"
          class="input"
          placeholder="输入好友昵称"
          @keydown.enter="handleAddFriend"
        />
        <button class="btn btn-primary" @click="handleAddFriend">添加</button>
      </div>
    </div>

    <div class="friend-list">
      <div
        v-for="friend in friendList"
        :key="friend.id"
        class="friend-item"
      >
        <div class="friend-avatar">{{ friend.name.charAt(0) }}</div>
        <div class="friend-info">
          <span class="friend-name">{{ friend.name }}</span>
        </div>
        <div class="friend-actions">
          <button class="btn btn-primary" @click="goChat(friend.id)">发消息</button>
          <button class="btn btn-danger" @click="handleRemoveFriend(friend.id)">删除</button>
        </div>
      </div>
      <div v-if="!friendList.length" class="empty-hint">暂无好友，添加一个吧</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const store = useUserStore()

const newFriendName = ref('')
const friendList = computed(() => store.friendList)

function handleAddFriend() {
  const added = store.addFriend(newFriendName.value)
  if (added) {
    newFriendName.value = ''
  } else if (newFriendName.value.trim()) {
    alert('该好友已存在')
  }
}

function handleRemoveFriend(friendId) {
  if (confirm('确定删除该好友？')) {
    store.removeFriend(friendId)
  }
}

function goChat(friendId) {
  router.push({ path: '/chat', query: { id: friendId, type: 'private' } })
}
</script>

<style scoped>
.friends-page {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.add-friend {
  display: flex;
  gap: 8px;
}

.add-friend .input {
  flex: 1;
}

.friend-list {
  background: var(--bg-white);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.friend-item:last-child {
  border-bottom: none;
}

.friend-avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 15px;
  font-weight: 500;
}

.friend-actions {
  display: flex;
  gap: 8px;
}

.empty-hint {
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
