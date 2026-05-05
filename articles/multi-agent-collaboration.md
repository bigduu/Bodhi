# 多 Agent 协作指南

Zenith 项目使用 GitHub Projects "Zenith Roadmap" 来协调多个 agent 在并行工作时的任务分配和冲突避免。这套机制确保多个开发者/agent 能够高效协作而不互相干扰。

---

## 看板工作流

```
Backlog → Triaged → Ready → In Progress → In Review → Done
```

### 各阶段说明

| 阶段 | 说明 |
|------|------|
| **Backlog** | 待评估的新任务 |
| **Triaged** | 已分类、有优先级和模块标签 |
| **Ready** | 已明确范围，等待认领 |
| **In Progress** | 已被认领，正在开发 |
| **In Review** | PR 已提交，等待审查 |
| **Done** | 已合并，任务完成 |

---

## 任务认领流程

### 1. 选择任务

- 从 Board 的 "Ready" 列选择任务
- 按优先级排序（P0 优先）
- 优先选择当前模块的任务以减少上下文切换

### 2. 标记认领

在 Issue 评论中标记：
```
🔒 claimed by <agent-id> at <timestamp>
```

### 3. 更新看板

- 状态 → In Progress
- 设置 Assignee Type 字段
- 设置 Branch 字段

---

## 并行约束

### 同模块限制

- **最多 2 个 agent** 同时在同一模块工作
- 例如：一个 feature + 一个 fix 可以并行

### 跨模块任务

- `scope:cross-module` 标签的任务必须**串行**执行
- 等待所有涉及模块都空闲时才能开始

### 隔离工作区

每个 agent 应该在隔离的工作区中工作：
```bash
git worktree add ../zenith-worktree-<branch-name>
cd ../zenith-worktree-<branch-name>
```

---

## 分支命名规范

```
<module>/<type>/<issue-number>-<short-desc>
```

### 示例

| 分支名 | 说明 |
|--------|------|
| `lotus/feat/142-conversation-export` | Lotus 功能开发 |
| `bamboo/fix/88-streaming-timeout` | Bamboo 问题修复 |
| `bodhi/refactor/55-window-mgmt` | Bodhi 重构 |
| `pavilion/docs/12-update-roadmap` | Pavilion 文档更新 |

### 类型标识

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 |
| `refactor` | 重构 |
| `docs` | 文档 |
| `test` | 测试 |
| `chore` | 维护 |

---

## 提交规范

### Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>

Refs: #<issue-number>
```

### 示例

```
feat(lotus): add conversation export (#142)

- Add export button to conversation header
- Support JSON and Markdown formats
- Include metadata in export

Refs: #142
```

### 子模块提交顺序

1. 先在子模块中提交并推送
2. 然后在根仓库更新子模块指针

```bash
# 在子模块中
cd bamboo
git add .
git commit -m "feat: add new tool support"
git push origin main

# 在根仓库
cd ..
git add bamboo
git commit -m "chore: update bamboo submodule pointer"
git push origin main
```

---

## Pull Request 流程

### PR 要求

- 一个 PR 对应一个 Issue
- PR 描述必须包含：
  - **Summary**: 变更内容和原因
  - **Test Plan**: 验证方式
  - **Screenshots**: UI 变更必须附截图

### 标签使用

| 标签 | 含义 |
|------|------|
| `agent:ready` | 任务已准备好，可被认领 |
| `agent:locked` | 已被认领，勿重复领取 |
| `agent:blocked` | 被依赖阻塞 |
| `review:needed` | 等待审查 |
| `review:agent` | Agent 审查完成，需人工最终审查 |
| `scope:cross-module` | 跨模块任务 |

### 审查流程

1. Agent 完成代码后提交 PR
2. 添加 `review:needed` 标签
3. 看板状态 → In Review
4. 其他模块的 Agent 可以进行交叉审查
5. Agent 审查通过后添加 `review:agent` 标签
6. 人工最终审查并合并

### 审查检查清单

- [ ] 满足 Issue 的 Acceptance Criteria
- [ ] 测试通过且覆盖率足够
- [ ] 无安全问题（OWASP Top 10）
- [ ] 遵循代码风格（cargo fmt/clippy, prettier）

---

## 完成流程

1. PR 合并后，看板状态 → Done
2. 删除工作分支
3. 如子模块有变更，更新根仓库的子模块指针

```bash
# 清理工作分支
git branch -d <branch-name>

# 更新子模块指针（如需要）
git add bamboo lotus bodhi pavilion
git commit -m "chore: prepare <version> release train"
git push origin main
```

---

## Issue 标题规范

```
[<module>] <type>: <short description>
```

### 示例

- `[lotus] feat: add conversation export`
- `[bamboo] fix: streaming timeout`
- `[bodhi] refactor: window management`
- `[pavilion] docs: update roadmap`

---

## 多 Agent 协作最佳实践

### 1. 沟通透明

- 所有状态更新都反映在看板上
- 阻塞立即标记 `agent:blocked` 并说明原因
- 每日检查看板状态

### 2. 范围聚焦

- 优先处理 Ready 列中优先级最高的任务
- 避免同时处理多个模块的任务
- 跨模块任务预留足够的串行时间

### 3. 质量保证

- 提交前运行完整的受影响测试套件
- 前端变更附截图
- 后端变更附测试证据

### 4. 冲突避免

- 使用 `git worktree` 创建隔离工作区
- 频繁从 main 分支 rebase 以保持最新
- 提交前检查子模块状态

---

## 相关链接

- [Zenith Roadmap 看板](https://github.com/users/bigduu/projects/3)
- [AGENTS.md 完整指南](../AGENTS.md)
- [GitHub 标签体系](../.github/labels.tsv)
- [PR 模板](../.github/pull_request_template.md)
