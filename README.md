# SaaS CRM Admin System（Public Showcase Version）

## 项目简介（中文）
这是一个面向 CRM 管理场景的前后端分离示例项目，包含客户、订单、合同、回款、用户与角色、权限模板、通知等后台管理模块，用于展示管理系统工程化能力与模块化设计思路。

---

## 🌍 Project Overview (English)
This is a front-end and back-end separated demo project designed for CRM management scenarios. It includes modules such as customers, orders, contracts, payments, users & roles, permission templates, and notifications.

The project is built to demonstrate:
- Engineering best practices
- Modular system design
- Clear architecture and layering

---

## 公开展示版说明（Public Showcase Notes）

当前仓库为公开展示版本：

This repository is a **public showcase version**:

- 业务流程与安全策略采用 demo-only 的简化实现  
  Business workflows and security strategies are simplified (demo-only)

- 保留完整的模块结构、路由组织、接口分层与类型约束方式  
  Full module structure, routing design, API layering, and type constraints are preserved

- 适用于作品展示、技术交流与二次学习，不作为生产系统直接使用  
  Suitable for portfolio showcase, technical discussion, and learning purposes — **not production-ready**

---

## 在线演示（Live Demo）

项目已部署到线上环境，可直接访问体验：

👉 http://www.gksaas.top

---

## 技术栈（Tech Stack）

### 前端（Frontend）
- React 19
- TypeScript
- Vite
- Ant Design
- Axios + Axios Mock Adapter
- Zustand

### 后端（Backend）
- Node.js
- Express 5
- TypeScript
- Zod
- Prisma Schema (for data modeling demonstration)

---

## 目录结构（Project Structure）

```text
.
├─ src/                         # 前端源码 (Frontend source)
│  ├─ api/                      # 接口层 (API layer)
│  ├─ components/               # 组件 (Components)
│  ├─ hooks/                    # 复用逻辑 (Hooks)
│  ├─ layouts/                  # 布局 (Layouts)
│  ├─ mock/                     # 前端 mock 数据 (Mock data)
│  ├─ pages/                    # 页面 (Pages)
│  ├─ router/                   # 路由与守卫 (Routing & guards)
│  ├─ store/                    # 状态管理 (State management)
│  └─ utils/                    # 工具函数 (Utilities)
├─ var/www/saas-backend/        # 后端源码 (Backend source)
│  ├─ src/
│  │  ├─ controllers/           # 控制器 (Controllers)
│  │  ├─ middlewares/           # 中间件 (Middlewares)
│  │  ├─ routes/                # 路由 (Routes)
│  │  ├─ services/              # 服务层 (Services - simplified)
│  │  ├─ validators/            # 请求校验 (Validators)
│  │  └─ config/                # 配置 (Config)
│  └─ prisma/schema.prisma      # 数据模型 (Data model)
├─ package.json                 # 前端脚本
└─ README.md
