import axios from "axios";
import { ElMessage } from "element-plus";
import { authConfig } from "@/config";

const service = axios.create({
  baseURL: "/api", // 请求的前缀
  timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前可以进行一些处理，例如添加 token
    const token = localStorage.getItem("token");
    if (token) {
      const rawToken = token.startsWith("Bearer ") ? token.slice(7) : token;
      const scheme = authConfig?.request?.authorizationScheme || "Bearer";
      const hasScheme = token.startsWith(`${scheme} `);
      const authorizationValue = hasScheme ? token : `${scheme} ${token}`;

      if (authConfig?.request?.sendAuthorization !== false) {
        const headerName =
          authConfig?.request?.authorizationHeader || "Authorization";
        config.headers[headerName] = authorizationValue;
      }

      if (authConfig?.request?.sendTokenHeader !== false) {
        const tokenHeaderName = authConfig?.request?.tokenHeader || "token";
        config.headers[tokenHeaderName] = rawToken;
      }
    }

    return config;
  },
  (error) => {
    // 处理请求错误
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 兼容：token 可能通过响应头返回（例如登录接口）
    // axios 会把 header key 规范化为小写
    const headerToken =
      response.headers?.[
        authConfig?.response?.authorizationHeader || "authorization"
      ] || response.headers?.[authConfig?.response?.tokenHeader || "token"];
    if (headerToken) {
      localStorage.setItem("token", headerToken);
    }

    // 对响应数据进行处理，例如统一处理错误码
    const { data, config } = response;

    // 兼容未使用 {code,data,msg} 包装的接口：直接返回 data
    if (!data || typeof data !== "object" || !("code" in data)) {
      return data;
    }

    if (data.code === "200") {
      return data.data;
    }

    if (data.code === "-1") {
      if (!config.url?.includes("/login")) {
        ElMessage.error(data.msg || "登录状态已过期，请重新登录");
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        // 用 SPA 路由跳转，避免整页刷新导致 Network 记录瞬间清空
        if (window.location.pathname !== "/auth/login") {
          import("@/router")
            .then((m) => m.default.push("/auth/login"))
            .catch(() => {
              window.location.href = "/auth/login";
            });
        }
      } else {
        ElMessage.error(data.msg || "登录状态已过期，请重新登录");
      }
      return Promise.reject(data);
    }

    // 保持原有行为：非 200 / -1 的情况不在这里强行处理
    return response;
  },
  (error) => {
    // 处理响应错误，例如统一处理错误码
    return Promise.reject(error);
  },
);

export default service;
