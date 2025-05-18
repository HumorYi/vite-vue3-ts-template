<template>
  <div>
    <button @click="toLogin">登录</button>
  </div>
  <div>
    <button @click="user.logout">登出</button>
  </div>
  <div v-if="user.hasRoutePermission(RouteName.settings.root)">
    <button @click="toSettings">设置</button>
  </div>
  <div v-if="user.isLogin" class="m-10">
    <button class="c-g">用户名: {{ user.user?.name }}</button>
  </div>
  <div v-if="user.hasRoutePermission(RouteName.user.root)">
    <button @click="toUser">用户</button>
  </div>
  <div class="mt-10">
    <button @click="download">下载</button>
  </div>

  <div class="v-input">
    <input placeholder="" v-model="value" v-validate="validateInput" />
  </div>

  <div class="copy flex-center">
    <div>{{ content }}</div>
    <button v-copy="content">复制(弹出提示复制成功)</button>
    <button v-copy.silence="content">复制(禁止弹出提示复制成功)</button>
  </div>

  <div class="debounce">
    <button
      v-debounce:1000="() => console.log('短时间连续点击，只会触发一次！')"
    >
      防抖
    </button>
  </div>

  <div class="throttle">
    <button
      v-throttle:1000="
        () => console.log('点击后会立马禁止点击，1秒后才能再次点击！')
      "
    >
      节流
    </button>
  </div>

  <div class="long-press">
    <button v-longPress="() => console.log('长按2秒后触发！')">长按</button>
  </div>

  <div
    class="water-marker"
    v-waterMarker="{ text: '绝密', textColor: 'rgba(180, 180, 180, 0.4)' }"
  >
    <p>版权所有</p>
    <p>商业机密</p>
    <p>严禁泄密</p>
    <p>哈哈哈哈</p>
  </div>

  <div class="draggable">
    <button v-draggable>无父元素</button>
  </div>

  <div class="draggable-arg">
    <button class="draggable-parent" v-draggable.parent>有父元素</button>
  </div>

  <div class="typewriter">
    <p v-typewriter>熟读唐诗三百首,不会作诗也会吟。</p>
    <ul v-typewriter>
      <li>1. 天下兴亡，匹夫有责。——顾炎武</li>
      <li>2. 人生自古谁无死，留取丹心照汗青。——文天祥</li>
    </ul>
  </div>
</template>

<script lang="ts" setup name="Home">
import { getFile } from '@/api/common'
import { RouteName } from '@/config/router'
import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'vue-router'

const router = useRouter()

const value = ref('')
const content = ref('被复制的内容')

const validateInput = (val: string) => {
  if (!val) {
    console.error('数据不能为空')

    return false
  }

  return true
}

const toLogin = () => router.push({ name: RouteName.login })
const toSettings = () => router.push({ name: RouteName.settings.root })
const toUser = () => router.push({ name: RouteName.user.root })

const user = useUserStore()

const download = async () => {
  await getFile({
    filename: 'test.txt'
  })

  console.log('download file')
}

onMounted(() => {
  console.log('首页')
})
</script>

<style lang="scss" scoped>
.v-input {
  width: 200px;
}

.water-marker {
  width: 400px;
  height: 400px;
}

.draggable {
  margin: 20px auto;
  width: 400px;
  height: 100px;
  background-color: green;
}

.draggable-arg {
  position: relative;
  top: 20px;
  left: 20px;
  margin: 20px auto;
  width: 400px;
  height: 100px;
  background-color: blue;

  .draggable-parent {
    top: 20px;
    left: 20px;
  }
}
</style>
