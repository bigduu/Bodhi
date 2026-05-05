# Bodhi Server 深度解析

Bodhi Server 是 Zenith 技术栈中的后端服务层组件，采用 Go 语言实现。它为 Bamboo 本地 runtime 提供补充性的服务端能力，特别是在需要中心化数据管理、用户认证和跨设备同步的场景下发挥关键作用。

---

## 定位与职责

### 在 Zenith 栈中的位置

```
┌─────────────────────────────────────────┐
│              Pavilion (官网)              │
├─────────────────────────────────────────┤
│              Bodhi (桌面壳)               │
│                 Lotus (UI)               │
├─────────────────────────────────────────┤
│           Bamboo (本地 Runtime)           │
│         - 任务执行                         │
│         - 工具调用                         │
│         - 上下文管理                        │
├─────────────────────────────────────────┤
│         Bodhi Server (后端服务)            │
│         - 用户认证                         │
│         - 数据持久化                        │
│         - 跨设备同步                        │
└─────────────────────────────────────────┘
```

### 核心职责

| 职责 | 说明 |
|------|------|
| **用户认证** | JWT-based 身份验证和会话管理 |
| **数据持久化** | PostgreSQL 数据库存储用户数据、配置和历史记录 |
| **API 服务** | RESTful API 供客户端调用 |
| **跨平台支持** | Docker 容器化部署，支持多平台运行 |

---

## 技术栈

### 依赖库

```go
module github.com/bigduu/bodhi-server

go 1.25.0

require (
    github.com/golang-jwt/jwt/v5 v5.3.1      // JWT 认证
    github.com/jackc/pgx/v5 v5.9.2           // PostgreSQL 驱动
    golang.org/x/crypto v0.50.0              // 加密工具
)
```

### 技术选型理由

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| Go | 1.25.0 | 高性能、编译型、低内存占用、优秀的并发支持 |
| PostgreSQL | 15+ | 可靠的关系型数据库，支持复杂查询和事务 |
| JWT | v5 | 行业标准认证方案，无状态、可扩展 |
| pgx | v5 | Go 语言最优秀的 PostgreSQL 驱动，支持连接池和高级特性 |

---

## 项目结构

```
bodhi-server/
├── api/                    # API 路由和处理函数
├── cmd/                    # 应用入口
│   └── server/             # 主服务入口
├── internal/               # 内部包
│   ├── config/             # 配置管理（已覆盖单元测试）
│   ├── auth/               # 认证逻辑
│   ├── database/           # 数据库访问层
│   └── middleware/         # HTTP 中间件
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile              # 容器镜像构建
├── go.mod                  # Go 模块定义
└── go.sum                  # 依赖校验
```

---

## 核心功能

### 1. JWT 认证系统

基于 `golang-jwt/jwt/v5` 实现：

- **Token 签发**：用户登录后签发 JWT
- **Token 验证**：每个受保护端点验证 Token 有效性
- **Token 刷新**：支持 Token 自动刷新机制
- **会话管理**：跟踪活跃会话和登出状态

### 2. PostgreSQL 持久化

基于 `jackc/pgx/v5` 实现：

- **连接池管理**：高效管理数据库连接
- **事务支持**：保证数据一致性
- **查询构建**：安全的参数化查询防止 SQL 注入
- **迁移系统**：数据库 schema 版本管理

### 3. RESTful API 设计

```
POST   /api/v1/auth/register     # 用户注册
POST   /api/v1/auth/login        # 用户登录
POST   /api/v1/auth/refresh      # 刷新 Token
DELETE /api/v1/auth/logout       # 用户登出

GET    /api/v1/user/profile      # 获取用户信息
PUT    /api/v1/user/profile      # 更新用户信息

GET    /api/v1/sessions          # 获取会话列表
GET    /api/v1/sessions/:id      # 获取会话详情
POST   /api/v1/sessions          # 创建会话
```

### 4. Docker 部署

**Dockerfile**：
- 多阶段构建，减小镜像体积
- 基于 Alpine Linux，轻量安全
- 非 root 用户运行

**docker-compose.yml**：
- 一键启动 Bodhi Server + PostgreSQL
- 环境变量配置
- 数据卷持久化

---

## 测试覆盖

### 已覆盖模块

| 模块 | 测试类型 | 覆盖率 |
|------|----------|--------|
| `internal/config` | 单元测试 | 完整覆盖 |

### 测试示例

```go
package config

import (
    "testing"
)

func TestLoadConfig(t *testing.T) {
    cfg, err := Load("../../testdata/config.yaml")
    if err != nil {
        t.Fatalf("failed to load config: %v", err)
    }
    
    if cfg.Database.Host == "" {
        t.Error("database host should not be empty")
    }
    
    if cfg.Server.Port == 0 {
        t.Error("server port should not be zero")
    }
}
```

### 运行测试

```bash
cd bodhi-server
go test ./...
go test -v ./internal/config
go test -cover ./...
```

---

## 部署指南

### 本地开发

```bash
cd bodhi-server

# 启动 PostgreSQL
docker-compose up -d postgres

# 运行服务
go run ./cmd/server
```

### Docker 部署

```bash
cd bodhi-server

# 构建镜像
docker build -t bodhi-server:latest .

# 启动服务
docker-compose up -d
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgres://user:pass@localhost/bodhi` |
| `JWT_SECRET` | JWT 签名密钥 | 必填 |
| `SERVER_PORT` | HTTP 服务端口 | `8080` |
| `LOG_LEVEL` | 日志级别 | `info` |

---

## 与 Bamboo 的协作

### 数据流

```
Bodhi (Desktop) → Bamboo (Local Runtime) → Bodhi Server (Backend)
     ↓                                              ↓
   UI 交互                                    数据持久化
   任务触发                                   用户认证
   结果展示                                   跨设备同步
```

### 使用场景

| 场景 | Bamboo | Bodhi Server |
|------|--------|--------------|
| 本地快速任务 | 直接使用 | 可选 |
| 多设备同步 | 执行 | 存储和同步 |
| 团队协作 | 执行 | 权限管理和共享 |
| 历史查询 | 缓存 | 完整历史存储 |

---

## 安全特性

### 1. TLS 连接

- 所有 API 通信强制 HTTPS
- 支持自定义 TLS 证书

### 2. 密码安全

- 使用 bcrypt 进行密码哈希
- 盐值随机生成

### 3. JWT 安全

- 短期 Token（默认 15 分钟）
- 长期 Refresh Token（默认 7 天）
- Token 黑名单支持登出

### 4. 输入验证

- 所有输入参数经过验证
- SQL 注入防护（参数化查询）
- XSS 防护（输出编码）

---

## 性能优化

### 1. 连接池

```go
// pgx 连接池配置
config, _ := pgxpool.ParseConfig(databaseURL)
config.MaxConns = 20
config.MinConns = 5
config.MaxConnLifetime = time.Hour
```

### 2. 请求限流

- 基于 IP 的请求限流
- 基于用户的并发限制

### 3. 缓存策略

- JWT 公钥缓存
- 用户配置缓存
- 数据库查询缓存

---

## 监控和日志

### 日志级别

- `debug` - 调试信息
- `info` - 常规操作
- `warn` - 警告
- `error` - 错误

### 关键指标

- 请求延迟 (P50, P95, P99)
- 数据库连接池使用率
- JWT 验证成功率
- 错误率

---

## 未来规划

- [ ] 完整的 API 文档（OpenAPI/Swagger）
- [ ] gRPC 支持高性能内部通信
- [ ] 分布式追踪（OpenTelemetry）
- [ ] 健康检查和就绪探针
- [ ] 配置热重载
- [ ] 更多数据库后端支持（MySQL, SQLite）

---

## 相关链接

- [Bodhi Server 源码](../../bodhi-server/)
- [Docker Compose 配置](../../bodhi-server/docker-compose.yml)
- [API 文档](../docs/#bodhi-server)
- [CI/CD 系统](./ci-cd-and-release-system.md)
