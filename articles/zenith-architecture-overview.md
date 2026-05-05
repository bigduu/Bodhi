# Zenith 架构总览

Zenith 是一个围绕 AI Agent 技术栈构建的薄层 monorepo，包含五个核心子模块和一个 Go 后端服务。每个模块有明确的职责边界，共同构成一个完整的桌面 AI 产品体系。

---

## 模块架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      Pavilion (官网/文档)                      │
│                    React + Vite 静态站点                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Bodhi (桌面产品)                          │
│                   Tauri + React 桌面应用                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Lotus (UI 交互层)                        ││
│  │              React + Vite + TypeScript                    ││
│  │  - 实时事件流渲染 (SSE)                                    ││
│  │  - 多窗格交互界面                                          ││
│  │  - 设置中心                                                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Bamboo (Agent Runtime)                      │
│                     Rust 执行引擎                            │
│  - 任务调度与管理                                             │
│  - 内置工具系统 (20+)                                         │
│  - MCP 扩展协议                                               │
│  - 上下文压缩与管理                                            │
│  - Workflow / Schedule 自动化                                 │
│  - HTTP API + SSE 事件流                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Bodhi Server (后端服务)                      │
│                      Go + PostgreSQL                         │
│  - 用户认证 (JWT)                                             │
│  - 数据持久化                                                 │
│  - RESTful API                                               │
│  - Docker 容器化部署                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 模块详解

### 1. Pavilion - 官网与文档

**技术栈**：React + Vite + TypeScript

**职责**：
- 产品介绍和转化入口
- 文档中心（上手、进阶、开发者路径）
- 下载页面
- 功能详解

**文件结构**：
```
pavilion/
├── src/
│   ├── App.tsx              # 主应用（单页应用路由）
│   ├── main.tsx             # 入口
│   └── index.css            # 样式
├── articles/                # 长篇文章
│   ├── why-i-built-my-own-agent.md
│   ├── ci-cd-and-release-system.md
│   ├── multi-agent-collaboration.md
│   └── bodhi-server-deep-dive.md
├── public/                  # 静态资源
│   └── screenshots/         # 产品截图
└── package.json
```

**关键特性**：
- 双语支持（中文/英文）
- 响应式设计
- 深色/浅色主题
- 基于 URL hash 的文档导航

---

### 2. Bodhi - 桌面壳

**技术栈**：Tauri + React + TypeScript + Rust

**职责**：
- 桌面应用窗口管理
- 原生系统集成（通知、快捷键、文件系统）
- 自动更新
- 安装包构建

**文件结构**：
```
bodhi/
├── src/                     # 前端源码
│   └── ...
├── src-tauri/               # Tauri 后端（Rust）
│   ├── src/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── Cargo.lock
```

**平台支持**：
- macOS (Apple Silicon + Intel)
- Windows
- Linux

---

### 3. Lotus - UI 交互层

**技术栈**：React + Vite + TypeScript

**职责**：
- 聊天界面
- 实时事件流渲染
- 任务状态可视化
- 工具调用透明化
- 设置中心

**关键特性**：
- SSE（Server-Sent Events）实时事件流
- 多窗格布局
- 历史会话管理
- Markdown 渲染
- 代码高亮

**与 Bamboo 通信**：
```typescript
// SSE 事件流
const eventSource = new EventSource(`/api/v1/events/${sessionId}`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateUI(data);
};

// API 调用
const response = await fetch('/api/v1/chat', {
  method: 'POST',
  body: JSON.stringify({ message, session_id: sessionId })
});
```

---

### 4. Bamboo - Agent Runtime

**技术栈**：Rust

**职责**：
- 本地 AI Agent 执行引擎
- 任务管理和调度
- 工具系统（内置 + MCP）
- 上下文压缩和记忆
- HTTP API 服务

**核心组件**：

| 组件 | 说明 |
|------|------|
| **Agent Loop** | 带边界的行动闭环 |
| **Context Manager** | 分层上下文管理 |
| **Tool System** | 20+ 内置工具 + MCP 扩展 |
| **Memory** | 持久化记忆系统 |
| **Workflow** | 多步骤执行模式复用 |
| **Schedule** | 定时自动化执行 |
| **SSE** | 实时事件流推送 |

**API 端点**：
```
POST /api/v1/chat
POST /api/v1/execute/{session_id}
GET  /api/v1/events/{session_id}
POST /api/v1/stop/{session_id}
GET  /api/v1/history/{session_id}

GET|POST     /api/v1/sessions
PATCH|DELETE /api/v1/sessions/{session_id}

GET|POST     /api/v1/schedules
PATCH|DELETE /api/v1/schedules/{schedule_id}
POST         /api/v1/schedules/{schedule_id}/run

GET|POST     /api/v1/mcp/servers
POST         /api/v1/mcp/servers/import
POST         /api/v1/mcp/servers/{id}/connect
```

**Provider 兼容接口**：
```
POST /openai/v1/chat/completions
POST /openai/v1/responses
POST /anthropic/v1/messages
POST /gemini/v1beta/models/{model}:generateContent
```

---

### 5. Bodhi Server - 后端服务

**技术栈**：Go + PostgreSQL + JWT

**职责**：
- 用户认证和授权
- 数据持久化
- 跨设备同步
- 服务端业务逻辑

**API 设计**：
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
DELETE /api/v1/auth/logout

GET    /api/v1/user/profile
PUT    /api/v1/user/profile

GET    /api/v1/sessions
POST   /api/v1/sessions
GET    /api/v1/sessions/:id
```

**部署方式**：
- Docker 容器化
- docker-compose 一键启动
- 支持独立部署

---

## 数据流

### 典型任务执行流

```
用户输入
  ↓
Lotus (UI 层) → 显示输入、发送请求
  ↓
Bamboo (Runtime) → 解析意图、创建任务
  ↓
工具调用（内置 / MCP）→ 执行操作
  ↓
SSE 事件流 → 实时推送进度
  ↓
Lotus (UI 层) → 实时更新界面
  ↓
结果展示
```

### 持久化数据流

```
Bamboo (本地) → 会话缓存、短期记忆
  ↓
Bodhi Server (后端) → 用户数据、历史记录、配置
  ↓
PostgreSQL → 长期持久化
```

---

## 技术选型对比

| 维度 | Bodhi | Lotus | Bamboo | Bodhi Server | Pavilion |
|------|-------|-------|--------|--------------|----------|
| **语言** | TS/Rust | TS | Rust | Go | TS |
| **框架** | Tauri | React+Vite | Axum | Stdlib | React+Vite |
| **职责** | 桌面壳 | UI 层 | 执行引擎 | 后端服务 | 官网 |
| **通信** | IPC | HTTP/SSE | HTTP/SSE | HTTP | 静态 |
| **部署** | 桌面安装 | Web/桌面 | 本地服务 | Docker | CDN |

---

## 开发工作流

### 本地开发启动

```bash
# 1. 初始化子模块
git submodule update --init --recursive

# 2. 启动 Bamboo runtime
cd bamboo
cargo run --bin bamboo -- serve --port 9562

# 3. 启动 Lotus UI
cd lotus
npm install
npm run dev

# 4. 启动 Bodhi 桌面（可选）
cd bodhi
npm install
npm run tauri:dev

# 5. 启动 Bodhi Server（可选）
cd bodhi-server
docker-compose up -d postgres
go run ./cmd/server

# 6. 启动 Pavilion 官网（可选）
cd pavilion
npm install
npm run dev
```

### 测试

```bash
# Bamboo
cd bamboo && cargo test

# Lotus
cd lotus && npm run test:run

# Bodhi Server
cd bodhi-server && go test ./...

# E2E
cd lotus && npm run test:e2e
```

---

## 发布流程

```
代码提交 → 测试通过 → 版本更新 → Release Train → 自动发布
                                       ↓
                              Bamboo → Lotus → Bodhi
                                       ↓
                                   验证可用性
```

详见 [CI/CD 与发布系统](./ci-cd-and-release-system.md)

---

## 安全架构

| 层级 | 措施 |
|------|------|
| **通信安全** | HTTPS/TLS、rustls-webpki |
| **认证安全** | JWT、bcrypt 密码哈希 |
| **输入安全** | 参数化查询、输入验证 |
| **依赖安全** | 定期更新、漏洞扫描 |
| **发布安全** | 代码审查、测试门禁 |

---

## 扩展性

### MCP（Model Context Protocol）

Bodhi 通过 MCP 协议连接外部工具和服务：

```
内置工具（Bamboo）
  ↓
MCP Server（外部扩展）
  ↓
第三方服务（Jira、Confluence、GitHub 等）
```

### Workflow 和 Schedule

```
单次任务成功
  ↓
保存为 Workflow（可复用模式）
  ↓
加入 Schedule（定时自动执行）
  ↓
持续自动化
```

---

## 监控和可观测性

### 指标收集

| 来源 | 指标 |
|------|------|
| Bamboo | 任务执行时间、工具调用次数、错误率 |
| Lotus | 页面加载时间、交互延迟 |
| Bodhi Server | API 延迟、数据库查询时间、认证成功率 |

### 日志

- 结构化日志（JSON 格式）
- 分级日志（DEBUG/INFO/WARN/ERROR）
- 请求追踪 ID

---

## 相关链接

- [Bodhi 源码](https://github.com/bigduu/Bodhi)
- [Lotus 源码](https://github.com/bigduu/Lotus)
- [Bamboo 源码](https://github.com/bigduu/Bamboo-agent)
- [CI/CD 文档](./ci-cd-and-release-system.md)
- [多 Agent 协作](./multi-agent-collaboration.md)
- [Bodhi Server 详解](./bodhi-server-deep-dive.md)
