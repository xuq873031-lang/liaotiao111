<template>
  <div class="app">
    <nav class="main-nav">
      <router-link to="/chat" class="nav-item" active-class="active">
        聊天
      </router-link>
      <router-link to="/friends" class="nav-item" active-class="active">
        好友
      </router-link>
      <router-link to="/groups" class="nav-item" active-class="active">
        群聊
      </router-link>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
// App 根组件 - 包含顶部导航和路由视图
</script>
