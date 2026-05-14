import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
  baseURL: "/api", // 请求的前缀
  timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data, config } = response;
    if (data.code === "200") {
      return data.data;
    } else {
      if (data.code === "-1") {
        if (!config.url.includes("/login")) {
          ElMessage.error(data.msg || "登录状态已过期，请重新登录");
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          window.location.href = "/auth/login";
        } else {
          ElMessage.error(data.msg || "登录状态已过期，请重新登录");
          return Promise.reject("登录状态已过期，请重新登录");
        }
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default service;
