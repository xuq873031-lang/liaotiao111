<template>
  <div class="groups-page">
    <div class="page-header">
      <h2>群聊</h2>
      <div class="create-group">
        <input
          v-model="newGroupName"
          type="text"
          class="input"
          placeholder="群名称"
          @keydown.enter="handleCreateGroup"
        />
        <button class="btn btn-primary" @click="handleCreateGroup">创建群</button>
      </div>
    </div>

    <div class="group-list">
      <div
        v-for="group in groups"
        :key="group.id"
        class="group-item"
      >
        <div class="group-avatar">{{ group.name.charAt(0) }}</div>
        <div class="group-info">
          <span class="group-name">{{ group.name }}</span>
          <span class="group-members">成员: {{ getMemberNames(group).join(', ') }}</span>
        </div>
        <div class="group-actions">
          <button class="btn btn-primary" @click="goChat(group.id)">进入群聊</button>
          <button class="btn" @click="openAddMember(group)">加人</button>
          <button class="btn btn-danger" @click="handleRemoveGroup(group.id)">解散</button>
        </div>
      </div>
      <div v-if="!groups.length" class="empty-hint">暂无群聊，创建一个吧</div>
    </div>

    <!-- 添加成员弹窗 -->
    <div v-if="showAddMember" class="modal-overlay" @click.self="showAddMember = false">
      <div class="modal">
        <h4>添加成员到「{{ currentGroup?.name }}」</h4>
        <div class="member-select">
          <div
            v-for="u in canAddMembers"
            :key="u.id"
            class="member-option"
            @click="addMember(u.id)"
          >
            {{ u.name }}
          </div>
          <div v-if="!canAddMembers.length" class="empty-hint">没有可添加的好友</div>
        </div>
        <button class="btn" @click="showAddMember = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useGroupStore } from '../stores/groupStore'

const router = useRouter()
const userStore = useUserStore()
const groupStore = useGroupStore()

const newGroupName = ref('')
const showAddMember = ref(false)
const currentGroup = ref(null)

const groups = computed(() => groupStore.groups)

const canAddMembers = computed(() => {
  if (!currentGroup.value) return []
  const members = currentGroup.value.members
  return userStore.friendList.filter(f => !members.includes(f.id))
})

function getMemberNames(group) {
  return group.members.map(id => userStore.getUserById(id)?.name || id)
}

function handleCreateGroup() {
  const group = groupStore.createGroup(newGroupName.value)
  if (group) {
    newGroupName.value = ''
  } else if (newGroupName.value.trim()) {
    alert('群名称不能为空')
  }
}

function handleRemoveGroup(groupId) {
  if (confirm('确定解散该群？')) {
    groupStore.removeGroup(groupId)
  }
}

function goChat(groupId) {
  router.push({ path: '/chat', query: { id: groupId, type: 'group' } })
}

function openAddMember(group) {
  currentGroup.value = group
  showAddMember.value = true
}

function addMember(userId) {
  if (!currentGroup.value) return
  groupStore.addMemberToGroup(currentGroup.value.id, userId)
  // 添加后刷新，如果无可添加成员则关闭
  if (canAddMembers.value.length <= 1) {
    showAddMember.value = false
  }
}
</script>

<style scoped>
.groups-page {
  padding: 24px;
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  margin-bottom: 16px;
}

.create-group {
  display: flex;
  gap: 8px;
}

.create-group .input {
  flex: 1;
}

.group-list {
  background: var(--bg-white);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
}

.group-item:last-child {
  border-bottom: none;
}

.group-avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #576b95;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 2px;
}

.group-members {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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
  max-height: 80vh;
  overflow: auto;
}

.modal h4 {
  margin-bottom: 12px;
}

.member-select {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.member-option {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
}

.member-option:hover {
  background: var(--bg-secondary);
}

.empty-hint {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
