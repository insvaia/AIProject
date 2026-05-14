<template>
  <div class="page-head">
    <h1 class="page-title">{{ props.title }}</h1>
    <div class="action-btn">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: "页面标题",
  },
});
</script>

<style scoped lang="scss">
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .page-title {
    font-size: 24px;
    color: #2d3748;
  }
}
</style>
