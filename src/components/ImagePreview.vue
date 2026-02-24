<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="image-preview-overlay"
        @click.self="close"
      >
        <div class="image-preview-content">
          <img
            :src="src"
            :style="{ maxWidth: maxWidth }"
            class="preview-img"
            loading="lazy"
            @click.stop
          />
          <button class="btn-close" @click="close" title="关闭">×</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: Boolean,
  src: { type: String, default: '' },
  maxWidth: { type: String, default: '90vw' }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
}

.image-preview-content {
  position: relative;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-height: 90vh;
  object-fit: contain;
  border-radius: 4px;
}

.btn-close {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  border-radius: 50%;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
