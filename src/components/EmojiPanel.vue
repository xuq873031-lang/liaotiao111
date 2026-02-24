<template>
  <div v-if="visible" class="emoji-panel-wrapper" ref="panelRef">
      <div class="emoji-panel">
        <div class="emoji-grid">
          <button
            v-for="(emoji, i) in EMOJI_LIST"
            :key="i"
            class="emoji-btn"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { EMOJI_LIST } from '../constants/emoji'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['insert', 'close'])

const panelRef = ref(null)

function insertEmoji(emoji) {
  emit('insert', emoji)
}

function handleClickOutside(e) {
  if (panelRef.value && !panelRef.value.contains(e.target)) {
    emit('close')
  }
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.emoji-panel-wrapper {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 8px;
  z-index: 200;
}

.emoji-panel {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.emoji-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-btn:hover {
  background: var(--bg-secondary);
}
</style>
