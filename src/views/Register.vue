<template>
  <div>
    <h2>注册</h2>
    <input v-model="username" placeholder="用户名" />
    <input v-model="password" type="password" placeholder="密码" />
    <button @click="handleRegister">注册</button>
    <p @click="$router.push('/login')">已有账号？去登录</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { register } from "@/api"
import { useRouter } from "vue-router"

const router = useRouter()
const username = ref("")
const password = ref("")

async function handleRegister() {
  const res = await register(username.value, password.value)

  if (res.success) {
    alert("注册成功")
    router.push("/login")
  } else {
    alert(res.message)
  }
}
</script>