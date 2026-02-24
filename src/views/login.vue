<template>
  <div>
    <h2>登录</h2>
    <input v-model="username" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="handleLogin">登录</button>
    <p @click="$router.push('/register')">没有账号？去注册</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { login } from "@/api"
import { useRouter } from "vue-router"

const router = useRouter()
const username = ref("")
const password = ref("")

async function handleLogin() {
  const res = await login(username.value, password.value)

  if (res.success) {
    localStorage.setItem("token", res.data.token)
    router.push("/chat")
  } else {
    alert(res.message)
  }
}
</script>