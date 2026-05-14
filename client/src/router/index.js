import { createRouter, createWebHistory } from "vue-router";
import BackendLayout from "@/components/BackendLayout/index.vue";
import AuthLayout from "@/components/AuthLayout/index.vue";
import FrontendLayout from "@/components/FrontendLayout/index.vue";

const backendRouter = [
  {
    path: "/back",
    name: "back",
    redirect: "/back/dashboard",
    component: BackendLayout,
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/Dashboard/index.vue"),
        meta: {
          title: "数据分析",
          icon: "PieChart",
        },
      },
      {
        path: "knowledge",
        component: () => import("@/views/Knowledge/index.vue"),
        meta: {
          title: "知识文章",
          icon: "Document",
        },
      },
      {
        path: "consultation",
        component: () => import("@/views/Consultation/index.vue"),
        meta: {
          title: "咨询记录",
          icon: "Message",
        },
      },
      {
        path: "emotional",
        name: "emotional",
        component: () => import("@/views/Emotional/index.vue"),
        meta: {
          title: "情绪日志",
          icon: "User",
        },
      },
    ],
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthLayout,
    redirect: "/auth/login",
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("@/views/Login/index.vue"),
      },
      {
        path: "register",
        name: "register",
        component: () => import("@/views/Register/index.vue"),
      },
    ],
  },
];

const frontendRouter = [
  {
    path: "/",
    component: FrontendLayout,
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/Home/index.vue"),
      },
      {
        path: "consultation",
        name: "consultation",
        component: () => import("@/views/ConsultationAI/index.vue"),
      },
      {
        path: "emotion-diary",
        name: "emotion-diary",
        component: () => import("@/views/EmotionDiary/index.vue"),
      },
      {
        path: "knowledge",
        name: "knowledge",
        component: () => import("@/views/FrontendKnowledge/index.vue"),
      },
      {
        path: "knowledge/article/:id",
        name: "knowledge-detail",
        component: () => import("@/views/ArticleDetail/index.vue"),
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRouter, ...frontendRouter],
});

// 路由的前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (token) {
    // 如果是后台用户访问登录页，则重定向到后台首页
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo.userType === 2) {
      if (to.path.startsWith("/back")) {
        next();
      } else {
        next("/back/dashboard");
      }
    } else if (userInfo.userType === 1) {
      // 如果是普通用户访问后台页面，则重定向到前台首页
      if (to.path.startsWith("/back") || to.path.startsWith("/auth")) {
        next("/");
      } else {
        next();
      }
    }
  } else {
    if (to.path.startsWith("/back")) {
      // 如果是访问后台页面则跳转到登录页
      next("/auth/login");
    } else {
      next();
    }
  }
});

export default router;
