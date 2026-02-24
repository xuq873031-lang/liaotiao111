# 撩聊 - 类微信桌面版即时通讯

基于 Vue3 + Vite + Pinia + Vue Router 的即时通讯示例项目，仿微信 PC 版布局。

## 技术栈

- **Vue 3** - Composition API (setup 语法)
- **Vite** - 构建工具
- **Pinia** - 模块化状态管理 (userStore, groupStore, chatStore)
- **Vue Router** - 路由
- **localStorage** - 数据持久化

## 项目结构

```
src/
├── main.js
├── App.vue
├── router/index.js
├── stores/
│   ├── index.js
│   ├── userStore.js      # 用户、好友
│   ├── groupStore.js     # 群组
│   └── chatStore.js      # 消息、会话、未读
├── utils/
│   ├── timeUtils.js      # 时间格式化、偏移
│   ├── storage.js
│   ├── debounce.js
│   └── id.js
├── constants/
│   └── emoji.js          # 50 个常用 emoji
├── components/
│   ├── ChatWindow.vue    # 聊天主窗口
│   ├── MessageItem.vue   # 单条消息（气泡、右键菜单）
│   ├── EmojiPanel.vue    # 表情面板
│   ├── ImagePreview.vue  # 图片预览弹窗
│   ├── SearchBar.vue     # 搜索栏（防抖）
│   └── ConversationList.vue  # 会话列表
├── views/
│   ├── Chat.vue          # 聊天页
│   ├── Friends.vue       # 好友页
│   └── Groups.vue        # 群聊页
└── styles/main.css
```

## 功能

- **聊天**：单聊/群聊、文本/图片、表情、消息撤回(2分钟内)、删除
- **搜索**：当前会话 / 全局搜索、关键字高亮、回车跳转下一条
- **表情**：50 个 emoji、点击插入光标位置
- **图片**：上传转 base64、点击放大预览、最大宽度限制
- **会话**：按最后消息排序、未读数、切换清零
- **时间模拟**：+1h/-1h/重置，用于测试

## 启动

```bash
npm install
npm run dev
```
