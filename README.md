# SaaS CRM Admin System（Public Showcase Version）

## 项目简介
这是一个面向 CRM 管理场景的前后端分离示例项目，包含客户、订单、合同、回款、用户与角色、权限模板、通知等后台管理模块，用于展示管理系统工程化能力与模块化设计思路。

## 公开展示版说明
当前仓库为公开展示版本（public showcase / portfolio version）。

- 业务流程与安全策略采用 demo-only 的简化实现
- 保留完整的模块结构、路由组织、接口分层与类型约束方式
- 适用于作品展示、技术交流与二次学习，不作为生产系统直接使用

## 技术栈
### 前端
- React 19
- TypeScript
- Vite
- Ant Design
- Axios + Axios Mock Adapter
- Zustand

### 后端
- Node.js
- Express 5
- TypeScript
- Zod
- Prisma Schema（用于展示数据建模方式）

## 目录结构
```text
.
├─ src/                         # 前端源码
│  ├─ api/                      # 接口层
│  ├─ components/               # 组件
│  ├─ hooks/                    # 复用逻辑
│  ├─ layouts/                  # 布局
│  ├─ mock/                     # 前端 mock 数据
│  ├─ pages/                    # 页面
│  ├─ router/                   # 路由与守卫
│  ├─ store/                    # 状态管理
│  └─ utils/                    # 工具函数
├─ var/www/saas-backend/        # 后端源码
│  ├─ src/
│  │  ├─ controllers/           # 控制器
│  │  ├─ middlewares/           # 中间件
│  │  ├─ routes/                # 路由
│  │  ├─ services/              # 服务层（showcase 简化实现）
│  │  ├─ validators/            # 请求校验
│  │  └─ config/                # 配置
│  └─ prisma/schema.prisma      # 数据模型定义
├─ package.json                 # 前端脚本
└─ README.md
```

## 启动方式
### 1) 前端
```bash
npm install
npm run dev
```
默认地址：`http://localhost:5173`

### 2) 后端
```bash
cd var/www/saas-backend
npm install
cp ../../.env.example .env
npm run dev
```
默认地址：`http://localhost:3000`

## 前端 Mock 模式说明
- `.env.example` 中提供 `VITE_USE_MOCK=true`
- 开启后前端会使用 `src/mock/index.ts` 的本地模拟接口数据
- 该模式用于快速演示页面交互，不依赖真实业务后端

## 后端简化实现说明
- 后端保留标准分层结构与接口组织
- 关键服务为 showcase 版本简化实现，便于展示工程能力
- Prisma schema 用于展示系统数据建模方式，不代表完整商业版能力

## 构建命令
### 前端构建
```bash
npm run build
```

### 后端构建
```bash
cd var/www/saas-backend
npm run build
```

## 注意事项
- 本仓库为公开展示版，所有示例数据均为虚构。
- 示例账号、邮箱、手机号、令牌仅用于演示，不具备真实鉴权意义。
- 如需用于生产，请自行补充完整业务逻辑、安全策略、审计与监控能力。
