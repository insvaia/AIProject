# MindCare AI - 智能心理健康咨询平台

基于 AI 大模型的智能心理健康咨询平台，提供 AI 心理对话、情绪日记、知识科普和数据分析等一站式心理健康服务。

## 功能特性

- **AI 智能咨询** — 基于 DeepSeek 大模型，使用流式 SSE 响应模拟真实心理咨询对话，支持情绪识别与分析
- **情绪日记** — 每日记录情绪状态、睡眠质量、压力水平，AI 自动生成情绪分析和改善建议
- **知识科普** — 心理健康文章管理，支持富文本编辑器，涵盖各类心理学知识
- **数据分析** — 管理后台提供可视化数据看板，实时掌握平台运营数据
- **用户系统** — 注册登录、JWT 鉴权、普通用户/管理员角色权限

## 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式前端框架 |
| Vite | 前端构建工具 |
| Element Plus | UI 组件库 |
| Pinia | 状态管理 |
| Vue Router | 路由管理 |
| ECharts | 数据可视化 |
| wangEditor | 富文本编辑器 |
| Axios | HTTP 请求库 |

### 后端

| 技术 | 说明 |
|------|------|
| Koa | Node.js Web 框架 |
| TypeScript | 类型安全 |
| Sequelize | ORM 框架 |
| MySQL | 关系型数据库 |
| JWT | 用户认证 |
| OpenAI SDK | AI 接口调用 (DeepSeek) |

## 项目结构

```
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件
│   │   ├── config/         # 项目配置
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # Pinia 状态
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面视图
│   │       ├── ConsultationAI/  # AI 咨询
│   │       ├── EmotionDiary/    # 情绪日记
│   │       ├── Knowledge/       # 知识管理
│   │       ├── Dashboard/       # 数据看板
│   │       └── ...
│   └── vite.config.js
├── server/                 # 后端项目
│   ├── src/
│   │   ├── config/         # 数据库配置
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   └── types/          # 类型声明
│   └── tsconfig.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm (推荐) 或 npm
- MySQL 8.0+

### 1. 克隆项目

```bash
git clone https://github.com/insvaia/AIProject
cd AIProject
```

### 2. 配置后端

```bash
cd server
pnpm install
```

修改 `server/.env` 文件，配置数据库和 API Key：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ai_project
PORT=3000
JWT_SECRET=your_jwt_secret_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

启动后端服务：

```bash
pnpm dev    # 开发模式（nodemon 热重载）
pnpm build  # 编译 TypeScript
pnpm start  # 生产模式
```

### 3. 配置前端

```bash
cd client
pnpm install
```

启动前端开发服务：

```bash
pnpm dev     # 开发模式
pnpm build   # 构建生产包
pnpm preview # 预览生产构建
```

### 4. 访问

- 前端页面：`http://localhost:5173`
- 后端 API：`http://localhost:3000`
- 管理后台：`http://localhost:5173/back/dashboard`

## API 接口

| 模块 | 路径 | 说明 |
|------|------|------|
| 用户 | `/api/users` | 注册、登录、个人信息 |
| 聊天 | `/api/chat` | AI 对话会话、流式消息 |
| 情绪日记 | `/api/emotion-diary` | 日记的增删查改 |
| 知识文章 | `/api/knowledge` | 文章管理 |
| 文件 | `/api/files` | 图片上传 |
| 分析 | `/api/analytics` | 数据统计看板 |

## License

MIT License
