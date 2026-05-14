<template>
  <div class="navbar">
    <div class="flex-box">
      <el-button @click="handleCollapse">
        <el-icon><Expand /></el-icon>
      </el-button>
      <p class="page-title">{{ route.meta.title }}</p>
    </div>
    <div class="flex-box">
      <el-dropdown @command="handleCommand">
        <div class="flex-box">
          <el-avatar style="margin-right: 10px" :src="avatar" />
          <p class="user-name">admin</p>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ArrowDown } from "@element-plus/icons-vue";
import { useAdminStore } from "../../stores/admin";
// useRoute 拿到的是路由的实例，可以获取当前路由的信息；useRouter 拿到的是路由器的实例，可以进行路由的跳转等操作。
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { logout } from "../../api/admin";

const route = useRoute();
const router = useRouter();

const store = useAdminStore();

const avatar = ref(
  "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
);

const handleCommand = async (command) => {
  if (command === "logout") {
    try {
      // 等待用户确认
      await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });

      // 用户点击确定后执行退出
      await logout();

      // 清除缓存
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");

      // 跳转到登录页
      router.push("/auth/login");

      // 可选：成功提示
      ElMessage.success("已退出登录");
    } catch (error) {
      // 用户点击取消或关闭弹窗
      if (error === "cancel") {
        // 用户主动取消，不处理
        console.log("用户取消了退出登录");
      } else {
        // 其他错误（如 logout 失败）
        ElMessage.error("退出登录失败，请重试");
      }
    }
  }
};

const handleCollapse = () => {
  store.toggleCollapse();
};
</script>

<style scoped lang="scss">
.navbar {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;
  .flex-box {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .page-title {
    font-size: 26px;
    font-weight: bold;
    color: #1f2937;
    margin-left: 20px;
  }
}
</style>
