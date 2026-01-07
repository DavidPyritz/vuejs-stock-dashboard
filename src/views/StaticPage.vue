<template>
  <div class="static-wrap">
    <iframe class="frame" :src="src" :title="title"></iframe>
  </div>
</template>

<script>
export default {
  name: "StaticPage",
  props: {
    src: { type: String, required: true },
    title: { type: String, default: "" },
  },
};
</script>

<style scoped>
.static-wrap {
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
}

.frame {
  width: 100%;
  height: calc(100vh - 48px);
  border: 0;
  border-radius: 12px;
}
</style>