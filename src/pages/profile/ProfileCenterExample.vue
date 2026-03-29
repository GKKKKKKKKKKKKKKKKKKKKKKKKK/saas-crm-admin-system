<template>
  <div class="profile-center-page">
    <header class="top-nav">
      <div class="brand">SaaS Admin</div>
      <div class="top-user">
        <UserAvatar :name="profile.name" :size="36" :bg-color="profile.navBgColor" />
        <span class="top-user-name">{{ profile.name || '未命名用户' }}</span>
      </div>
    </header>

    <main class="content-wrap">
      <aside class="left-card">
        <UserAvatar
          :name="profile.name"
          :size="96"
          :bg-color="profile.cardBgColor"
          :text-color="profile.textColor"
        />
        <h3 class="card-name">{{ profile.name || '未设置姓名' }}</h3>
        <p class="card-title">{{ profile.title || '-' }}</p>
      </aside>

      <section class="demo-panel">
        <h2>头像规则演示</h2>
        <div class="demo-row">
          <div class="demo-item">
            <UserAvatar name="陈总" :size="56" />
            <span>陈总 → 陈</span>
          </div>
          <div class="demo-item">
            <UserAvatar name="aaa" :size="56" />
            <span>aaa → A</span>
          </div>
          <div class="demo-item">
            <UserAvatar name="" :size="56" />
            <span>空值 → ?</span>
          </div>
        </div>

        <div class="form-row">
          <label>姓名</label>
          <input v-model="profile.name" placeholder="请输入姓名" />
        </div>
        <div class="form-row">
          <label>顶部头像背景色</label>
          <input v-model="profile.navBgColor" placeholder="例如 #1677ff，不填则自动生成" />
        </div>
        <div class="form-row">
          <label>左侧卡片背景色</label>
          <input v-model="profile.cardBgColor" placeholder="例如 #722ed1，不填则自动生成" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'

const profile = reactive({
  name: '陈总',
  title: '运营负责人',
  navBgColor: '',
  cardBgColor: '',
  textColor: '#fff'
})
</script>

<style scoped>
.profile-center-page {
  min-height: 100vh;
  background: #f5f7fb;
  color: #1f2329;
}

.top-nav {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e5e6eb;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  font-size: 18px;
  font-weight: 700;
}

.top-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.top-user-name {
  font-size: 14px;
  color: #1f2329;
}

.content-wrap {
  display: flex;
  gap: 16px;
  padding: 16px;
}

.left-card {
  width: 280px;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.card-name {
  margin: 14px 0 6px;
  font-size: 20px;
  font-weight: 600;
}

.card-title {
  margin: 0;
  color: #86909c;
}

.demo-panel {
  flex: 1;
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 12px;
  padding: 20px;
}

.demo-panel h2 {
  margin: 0 0 16px;
}

.demo-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.form-row label {
  width: 140px;
  color: #4e5969;
}

.form-row input {
  width: 320px;
  height: 34px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 10px;
  outline: none;
}

.form-row input:focus {
  border-color: #1677ff;
}
</style>
