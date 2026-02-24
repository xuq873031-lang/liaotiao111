<template>
  <div class="search-bar" :class="{ focused: isFocused }">
    <span class="search-icon">🔍</span>
    <input
      ref="inputRef"
      v-model="keyword"
      type="text"
      class="search-input"
      :placeholder="placeholder"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown.enter.prevent="handleEnter"
      @keydown.escape="handleEscape"
    />
    <button v-if="keyword" class="btn-clear" @click="clear">×</button>
    <div v-if="showCount && matchCount >= 0" class="search-count">
      {{ matchCount }} 条匹配
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { debounce } from '../utils/debounce'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索' },
  matchCount: { type: Number, default: -1 },
  showCount: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'search', 'enter', 'clear'])

const keyword = ref(props.modelValue)
const isFocused = ref(false)
const inputRef = ref(null)

const debouncedSearch = debounce((val) => emit('search', val), 300)

watch(keyword, (val) => {
  emit('update:modelValue', val)
  debouncedSearch(val)
})

watch(() => props.modelValue, (val) => {
  if (val !== keyword.value) keyword.value = val
})

function handleEnter() {
  emit('enter')
}

function handleEscape() {
  clear()
}

function clear() {
  keyword.value = ''
  emit('clear')
}

defineExpose({ focus: () => inputRef.value?.focus() })
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid transparent;
}

.search-bar.focused {
  background: white;
  border-color: var(--accent);
}

.search-icon {
  font-size: 14px;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
}

.btn-clear {
  width: 20px;
  height: 20px;
  border: none;
  background: var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  color: var(--text-secondary);
}

.btn-clear:hover {
  background: var(--text-secondary);
  color: white;
}

.search-count {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
