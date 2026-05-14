<template>
  <div class="login-container">
    <div class="title">
      <el-button class="back-home" text @click="$router.push('/')">
        <el-icon><Back /></el-icon>
        <span>返回首页</span>
      </el-button>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>请输入您的登录信息</p>
      </div>
      <div class="form-container">
        <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="rules"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              size="large"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              size="large"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
          <el-button
            class="btn"
            type="primary"
            size="large"
            @click="handleSubmit(ruleFormRef)"
            >登录账户</el-button
          >
        </el-form>
        <div class="footer">
          <p>
            还没有账户？<router-link to="/auth/register">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Back } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { login } from "@/api/admin";
import { useRouter } from "vue-router";

const router = useRouter();

const ruleFormRef = ref();
const formData = reactive({
  username: "",
  password: "",
});

const rules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

const handleSubmit = async (formEl) => {
  if (!formEl) {
    return;
  }
  await formEl.validate((valid, fields) => {
    if (valid) {
      login(formData).then((data) => {
        if (!data.token) {
          return ElMessage.error("登录失败，请检查用户名和密码");
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
        if (data.userInfo.userType === 2) {
          ElMessage.success("登录成功");
          router.push("/back/dashboard");
        } else {
          ElMessage.success("登录成功");
          router.push("/");
        }
      });
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  width: 384px;
  .title {
    .back-home {
      margin-bottom: 60px;
    }
    .title-text {
      text-align: center;
      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }
      p {
        font-size: 20px;
        color: #6b7280;
      }
    }
  }
  .form-container {
    margin-top: 30px;
    .btn {
      margin-top: 40px;
      width: 100%;
    }
    .footer {
      padding: 30px;
      text-align: center;
    }
  }
}
</style>
