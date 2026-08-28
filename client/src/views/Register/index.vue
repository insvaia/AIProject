<template>
  <div class="container">
    <div class="title">
      <div class="title-text">
        <h2>创建您的账户</h2>
        <p>请填写注册信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form
        label-position="top"
        :model="formData"
        :rules="rules"
        ref="submitFormRef"
      >
        <el-form-item label=" 用户名或邮箱" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名或邮箱"
            size="large"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            size="large"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="formData.nickname"
            placeholder="请输入昵称"
            size="large"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            placeholder="请输入密码"
            size="large"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            placeholder="请确认密码"
            size="large"
            type="password"
            show-password
          />
        </el-form-item>
        <el-button
          type="primary"
          @click="submitForm(submitFormRef)"
          class="btn"
          size="large"
          >注册</el-button
        >
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { register } from "@/api/frontend.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

const formData = reactive({
  username: "",
  email: "",
  nickname: "",
  phone: "",
  password: "",
  confirmPassword: "",
  gender: 0,
  userType: 1,
});

const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error("请确认密码"));
  } else if (value !== formData.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: ["blur", "change"] },
  ],
});

const router = useRouter();

// 表单提交
const submitFormRef = ref(null);
const submitForm = async (formEl) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (!valid) return;

    const { confirmPassword, ...registerData } = formData;
    register(registerData).then(({ data }) => {
      if (!data) {
        ElMessage.success("注册成功");
        router.push("/auth/login");
        return;
      }
      if (data.code === "BUSINESS_ERROR") {
        ElMessage.error(data.message);
        return;
      }
    });
  });
};
</script>

<style scoped lang="scss">
.container {
  width: 384px;
  .flex-box {
    display: flex;
    align-items: center;
  }
  .title {
    .title-text {
      text-align: center;
      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }
      p {
        font-size: 18px;
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
