import { useEffect, useMemo, useRef, useState } from 'react'

type Locale = 'zh' | 'en'
type TimelineState = 'done' | 'live' | 'queued'

type HeroStat = {
  value: string
  label: string
}

type TimelineEvent = {
  time: string
  title: string
  state: TimelineState
}

type HighlightItem = {
  title: string
  description: string
  points: string[]
}

type ShowcasePanel = {
  kicker: string
  title: string
  badge: string
  imageSrc: string
  imageAlt: string
}

type Capability = {
  kicker: string
  title: string
  description: string
  points: string[]
  featureId?: string
}

type FAQItem = {
  question: string
  answer: string
}

type FeatureSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  imageSrc?: string
  imageAlt?: string
  code?: string
}

type DocSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  code?: string
}

type Translation = {
  meta: {
    homeTitle: string
    docsTitle: string
    featuresTitle: string
  }
  nav: {
    brand: string
    brandTagline: string
    highlights: string
    features: string
    download: string
    faq: string
    docs: string
    github: string
    home: string
    overview: string
    firstRun: string
    powerUsers: string
    developers: string
    api: string
    bodhiServer: string
    cicd: string
    multiAgent: string
    security: string
    language: string
  }
  hero: {
    kicker: string
    title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    chips: string[]
    stats: HeroStat[]
    liveLabel: string
    liveTitle: string
    liveSummary: string
    liveBadges: string[]
    liveTimeline: TimelineEvent[]
  }
  highlights: {
    kicker: string
    title: string
    items: HighlightItem[]
  }
  showcase: {
    kicker: string
    title: string
    panels: ShowcasePanel[]
  }
  capabilities: {
    kicker: string
    title: string
    items: Capability[]
  }
  faq: {
    kicker: string
    title: string
    items: FAQItem[]
  }
  download: {
    primaryCta: string
    secondaryCta: string
    githubCta: string
  }
  features: {
    kicker: string
    title: string
    description: string
    updatedLabel: string
    tocTitle: string
    sections: FeatureSection[]
  }
  docs: {
    kicker: string
    title: string
    description: string
    updatedLabel: string
    tocTitle: string
    sections: DocSection[]
  }
  footer: {
    home: string
    docs: string
  }
}

const LANGUAGE_STORAGE_KEY = 'pavilion-locale'
const BODHI_GITHUB_URL = 'https://github.com/bigduu/Bodhi'
const BODHI_RELEASES_URL = 'https://github.com/bigduu/Bodhi/releases'
const BODHI_LATEST_RELEASE_URL = 'https://github.com/bigduu/Bodhi/releases/latest'

const quickstartCode = String.raw`# clone the public stack side-by-side
mkdir bodhi-stack && cd bodhi-stack
git clone https://github.com/bigduu/Bamboo-agent.git bamboo
git clone https://github.com/bigduu/Lotus.git lotus
git clone https://github.com/bigduu/Bodhi.git bodhi

# terminal 1: bamboo runtime
cd bamboo
cargo run --bin bamboo -- serve --port 9562 --bind 127.0.0.1 --data-dir /tmp/bamboo-data

# terminal 2: lotus ui
cd ../lotus
npm install
npm run dev

# terminal 3: bodhi desktop shell
cd ../bodhi
npm install
npm run tauri:dev`

const repoGuideCode = String.raw`Bodhi   https://github.com/bigduu/Bodhi
Lotus   https://github.com/bigduu/Lotus
Bamboo  https://github.com/bigduu/Bamboo-agent`

const apiCode = String.raw`# core runtime
POST /api/v1/chat
POST /api/v1/execute/{session_id}
GET  /api/v1/events/{session_id}
POST /api/v1/stop/{session_id}
GET  /api/v1/history/{session_id}

# sessions and schedules
GET|POST          /api/v1/sessions
PATCH|DELETE      /api/v1/sessions/{session_id}
GET|POST          /api/v1/schedules
PATCH|DELETE      /api/v1/schedules/{schedule_id}
POST              /api/v1/schedules/{schedule_id}/run
GET               /api/v1/schedules/{session_id}/sessions

# mcp
GET|POST          /api/v1/mcp/servers
POST              /api/v1/mcp/servers/import
POST              /api/v1/mcp/servers/{id}/connect
POST              /api/v1/mcp/servers/{id}/disconnect
POST              /api/v1/mcp/servers/{id}/refresh
GET               /api/v1/mcp/tools

# provider-compatible prefixes
POST /openai/v1/chat/completions
POST /openai/v1/responses
POST /anthropic/v1/messages
POST /gemini/v1beta/models/{model}:generateContent`

const translations: Record<Locale, Translation> = {
  zh: {
    meta: {
      homeTitle: 'Bodhi AI · 桌面 AI Agent 工作台',
      docsTitle: 'Bodhi AI 文档 · 上手、自动化与开发者路径',
      featuresTitle: 'Bodhi AI 功能详解 · 桌面工作台、运行时与自动化',
    },
    nav: {
      brand: 'Bodhi AI',
      brandTagline: 'AI that actually works',
      highlights: '为什么是 Bodhi',
      features: '功能',
      download: '下载',
      faq: 'FAQ',
      docs: '文档',
      github: 'GitHub',
      home: '首页',
      overview: '概览',
      firstRun: '第一次运行',
      powerUsers: '进阶玩法',
      developers: '开发者',
      api: 'API',
      bodhiServer: 'Bodhi Server',
      cicd: 'CI/CD',
      multiAgent: '多 Agent 协作',
      security: '安全',
      language: '语言',
    },
    hero: {
      kicker: 'BODHI AI',
      title: '不只会聊天的桌面 AI',
      subtitle:
        'Bodhi 把结构化执行、可见过程和长期自动化收敛成一套真正可用的桌面 AI 产品——它不只会回答，会拆解任务、调用工具、持续推进执行，并把成功经验沉淀成自动化。',
      primaryCta: '下载 Bodhi',
      secondaryCta: '快速开始',
      chips: ['会执行', '过程可见', '可持续自动化'],
      stats: [
        { value: 'Rust Runtime', label: 'Bamboo 提供本地结构化执行内核' },
        { value: '实时可见', label: '任务、工具和事件流持续可见' },
        { value: '越用越强', label: '成功执行沉淀为 Workflow 和 Schedule' },
      ],
      liveLabel: '实时任务流',
      liveTitle: 'AI 在替你推进任务，而不只是在回消息',
      liveSummary:
        'Bodhi 给 AI 产品表面，Lotus 让过程可见，Bamboo 给执行骨架。你看到的不是聊天，而是一套正在工作的桌面 AI 系统。',
      liveBadges: ['Bodhi Desktop', 'Lotus UI', 'Bamboo Runtime', 'MCP Tools'],
      liveTimeline: [
        { time: '00:00', title: '接收目标：整理本周事项并生成日报', state: 'done' },
        { time: '00:03', title: '创建任务清单并流式返回执行计划', state: 'done' },
        { time: '00:08', title: '连接 MCP、读取上下文并继续推进执行', state: 'live' },
        { time: '00:14', title: '写出结果，并把下一次运行交给自动化', state: 'queued' },
      ],
    },
    highlights: {
      kicker: 'WHY BODHI',
      title: '不只是另一个聊天 AI',
      items: [
        {
          title: '会执行',
          description: '不只是生成回答，而是拆解任务、调用工具、持续推进执行，直到目标达成。',
          points: ['拆解目标为可执行步骤', '调用内置工具和 MCP 扩展', '持续保持任务状态直到完成'],
        },
        {
          title: '过程可见',
          description: '任务状态、工具调用、事件流实时可见，让你始终知道 AI 在做什么、进展如何。',
          points: ['SSE 驱动的实时事件流', '任务和工具过程全程可见', '状态变化持续可追踪'],
        },
        {
          title: '可持续',
          description: '把成功执行沉淀为 Workflow 和 Schedule，让 AI 越用越懂你的工作节奏。',
          points: ['Workflow 复用成功模式', 'Schedule 建立自动化节奏', '长期使用越用越强'],
        },
      ],
    },
    showcase: {
      kicker: 'PRODUCT',
      title: '真实产品界面，不是概念图',
      panels: [
        {
          kicker: 'System Settings',
          title: '统一设置中心',
          badge: 'Settings',
          imageSrc: '/screenshots/bodhi-system-settings-provider.png',
          imageAlt: 'Bodhi System Settings 界面截图',
        },
        {
          kicker: 'MCP',
          title: 'MCP 扩展管理',
          badge: 'MCP',
          imageSrc: '/screenshots/bodhi-mcp.png',
          imageAlt: 'Bodhi MCP 界面截图',
        },
        {
          kicker: 'Metrics',
          title: '使用指标统计',
          badge: 'Metrics',
          imageSrc: '/screenshots/bodhi-metrics.png',
          imageAlt: 'Bodhi Metrics 界面截图',
        },
      ],
    },
    capabilities: {
      kicker: 'CAPABILITIES',
      title: '四大核心能力',
      items: [
        {
          kicker: '01',
          title: '桌面工作台',
          description: '安装、设置、Provider、环境变量、技能、指标——全部在一个桌面界面里完成。',
          points: ['桌面优先入口', '引导式首次设置', '完整产品体验'],
          featureId: 'desktop',
        },
        {
          kicker: '02',
          title: '结构化运行时',
          description: 'Bamboo 提供本地 Rust runtime，把任务、工具、记忆、调度组织成可演进的执行内核。',
          points: ['本地 Rust 执行内核', '上下文与记忆一体化', 'HTTP API 全覆盖'],
          featureId: 'runtime',
        },
        {
          kicker: '03',
          title: '可见执行',
          description: '任务、工具调用、事件流、状态变化全程可见，长任务也更可理解。',
          points: ['SSE 实时反馈', '任务进度可视化', '工具调用透明化'],
          featureId: 'visible',
        },
        {
          kicker: '04',
          title: '自动化系统',
          description: 'MCP 扩展能力边界，Workflow 复用成功执行，Schedule 建立长期自动化节奏。',
          points: ['MCP Server 扩展', 'Workflow 复用', 'Schedule 定时执行'],
          featureId: 'automation',
        },
      ],
    },
    faq: {
      kicker: 'FAQ',
      title: '常见问题',
      items: [
        {
          question: 'Bodhi 和 Bamboo、Lotus 分别是什么关系？',
          answer:
            'Bodhi 是桌面产品，Lotus 是 UI 交互层，Bamboo 是本地 Agent runtime。三者协作构成完整的桌面 AI 系统。',
        },
        {
          question: 'Bodhi 是不是只是一个聊天界面？',
          answer:
            '不是。它可以执行任务、展示实时进度、调用工具、接入 MCP、保存 Workflow，并通过 Schedule 做自动化。',
        },
        {
          question: '我应该从哪里开始？',
          answer:
            '推荐从桌面端 Bodhi 开始。也可以先看文档里的 First run 章节，了解设置路径后再下载。',
        },
        {
          question: '开发者应该从哪个模块开始？',
          answer:
            '桌面壳看 Bodhi，前端交互看 Lotus，执行引擎看 Bamboo。文档页已按这三层整理了入口。',
        },
        {
          question: 'Bodhi 和其他 Agent 产品有什么不同？',
          answer:
            'Bodhi 不只是 UI 层套模型，而是建立在 Bamboo（本地 Rust runtime）之上的完整桌面产品，拥有自己的执行路径、上下文记忆、工具系统和自动化能力。',
        },
      ],
    },
    download: {
      primaryCta: '下载 Bodhi',
      secondaryCta: '快速开始',
      githubCta: 'GitHub',
    },
    features: {
      kicker: 'FEATURES',
      title: '功能详解',
      description: '了解 Bodhi 的每一个核心能力——从桌面产品体验到底层执行引擎。',
      updatedLabel: '最近更新',
      tocTitle: '功能目录',
      sections: [
        {
          id: 'desktop',
          title: '桌面工作台',
          paragraphs: [
            'Bodhi 是用户直接使用的桌面产品入口。安装后，你会看到一个完整的桌面应用——不是 CLI 循环，不是网页聊天框，而是一个有设置中心、技能管理、环境变量配置和使用统计的真实产品。',
            '首次启动时，Bodhi 会引导你完成 Provider 配置、网络检测和基础设置，确保第一次使用尽量无摩擦。',
          ],
          bullets: [
            '引导式首次设置：检测网络环境、配置 Provider、确认基础选项',
            '统一设置中心：Provider、系统能力、运行边界都有清晰入口',
            '环境变量管理：变量注入、secret 管理与本地执行上下文',
            '技能系统：可浏览、可检索的能力层，让产品边界清晰可见',
            '使用指标：历史使用汇总和效率信号，强化长期使用心智',
          ],
          imageSrc: '/screenshots/bodhi-system-settings-provider.png',
          imageAlt: 'Bodhi 桌面设置中心',
        },
        {
          id: 'runtime',
          title: '结构化运行时 (Bamboo)',
          paragraphs: [
            'Bamboo 是 Bodhi 的执行引擎——一个本地 Rust runtime，把任务调度、工具系统、上下文记忆和扩展能力组织成一个真正的执行内核。',
            '它不依赖第三方 Agent 框架拼装核心链路，而是拥有自己的执行路径：从接收目标、创建任务、调用工具，到输出结果、保存上下文和触发后续自动化。',
          ],
          bullets: [
            '本地 Rust runtime：高性能、低延迟、完全本地执行',
            '任务系统：目标拆解、步骤管理、状态追踪',
            '工具系统：内置工具（文件操作、命令执行、网络请求等）',
            '上下文与记忆：长任务不丢失上下文，跨会话保持记忆',
            'HTTP API：完整的 RESTful 接口，支持前端、桌面端和自动化脚本',
            'SSE 事件流：实时推送执行进度、工具调用和状态变化',
          ],
          code: apiCode,
        },
        {
          id: 'visible',
          title: '可见执行 (Lotus)',
          paragraphs: [
            'Lotus 是 Bodhi 的 UI 交互层，让 Agent 的执行过程真正可见。你不需要等一个黑箱返回结果——任务进展、工具调用、状态变化都实时呈现在界面上。',
            '基于 SSE（Server-Sent Events）的事件驱动架构，让每一个执行步骤都实时可追踪。',
          ],
          bullets: [
            '实时事件流：SSE 驱动，任务进度实时可见',
            '任务状态可视化：每个步骤的状态（排队、执行中、完成）清晰展示',
            '工具调用透明化：看到 AI 调用了什么工具、传了什么参数、得到了什么结果',
            '多窗格交互：同时查看对话、工具输出和任务状态',
            '会话管理：历史会话可追溯，支持回看和复用',
          ],
          imageSrc: '/screenshots/bodhi-workbench.png',
          imageAlt: 'Bodhi 工作台界面',
        },
        {
          id: 'mcp',
          title: 'MCP 与扩展',
          paragraphs: [
            'MCP（Model Context Protocol）让 Bodhi 的能力边界可以持续扩展。通过接入 MCP Server，你可以把外部工具、数据源和系统集成到执行链路中。',
            'Bodhi 提供可视化的 MCP Server 管理：添加、配置、连接、刷新——都在设置中心里完成。',
          ],
          bullets: [
            'MCP Server 管理：添加、配置、连接、断开、刷新',
            'MCP Server 导入：批量导入 MCP 配置',
            '工具发现：自动发现已连接 MCP Server 提供的工具',
            'Provider 兼容接口：支持 OpenAI、Anthropic、Gemini 等前缀',
          ],
          imageSrc: '/screenshots/bodhi-mcp.png',
          imageAlt: 'Bodhi MCP 管理界面',
        },
        {
          id: 'automation',
          title: 'Workflow 与 Schedule',
          paragraphs: [
            'Bodhi 的长期价值不只在于一次任务成功，而在于把高频动作沉淀成系统能力。Workflow 保存多步骤执行模式，Schedule 让这些模式按节奏自动运行。',
            '最佳路径：先验证单次任务有效 → 保存为 Workflow → 加入 Schedule 建立固定节奏。',
          ],
          bullets: [
            'Workflow：保存成功的多步骤执行模式，一键复用',
            'Schedule：定时自动执行 Workflow，建立长期自动化节奏',
            'Session 管理：查看历史执行，回溯和复用',
            '执行历史：完整的运行记录和结果追踪',
          ],
          imageSrc: '/screenshots/bodhi-overview.png',
          imageAlt: 'Bodhi 自动化概览',
        },
        {
          id: 'skills',
          title: '技能系统',
          paragraphs: [
            '技能系统让 Bodhi 的能力以可浏览、可检索的方式呈现。每个技能代表一个具体的产品能力——从文件操作到代码执行，从网络请求到数据分析。',
          ],
          bullets: [
            '可浏览的技能目录',
            '可搜索的能力索引',
            '技能执行状态追踪',
          ],
          imageSrc: '/screenshots/bodhi-skills.png',
          imageAlt: 'Bodhi 技能系统',
        },
        {
          id: 'architecture',
          title: '技术架构',
          paragraphs: [
            'Bodhi 采用三层架构：Bodhi（桌面壳）负责产品入口和原生集成；Lotus（React + Vite）负责 UI 交互层；Bamboo（Rust）负责本地执行和 API 服务。',
            '前端通过 Bamboo 的 `/api/v1/*` 端点与 runtime 通信，通过 `/api/v1/events/{session_id}` 接收实时事件流。',
          ],
          bullets: [
            'Bodhi：桌面安装、引导设置、原生集成、发布交付',
            'Lotus：React + Vite 交互层、SSE 实时渲染、设置中心',
            'Bamboo：Rust runtime、HTTP API、内置工具、MCP、Workflow、Schedule',
            'Bodhi Server：Go 后端服务、认证、数据持久化、Docker 部署',
            'Pavilion：官网与文档入口',
          ],
          code: repoGuideCode,
        },
        {
          id: 'bodhi-server',
          title: 'Bodhi Server 后端服务',
          paragraphs: [
            'Bodhi Server 是 Zenith 栈的服务端组件，采用 Go 语言实现，为 Bamboo runtime 提供补充性的服务端能力。它处理用户认证、数据持久化、以及需要中心化管理的业务逻辑。',
            '与 Bamboo 的本地运行不同，Bodhi Server 设计为可独立部署的服务。它通过 RESTful API 暴露能力，使用 PostgreSQL 存储数据，JWT 处理认证，并完全支持容器化部署。',
          ],
          bullets: [
            'Go 实现：高性能、编译型、低资源占用',
            'JWT 认证：基于 golang-jwt/jwt/v5 的安全认证',
            'PostgreSQL：基于 jackc/pgx/v5 的数据库访问',
            'Docker 支持：Dockerfile + docker-compose.yml 一键部署',
            '测试覆盖：internal/config 包已有完整单元测试',
          ],
        },
        {
          id: 'cicd',
          title: '发布与自动化',
          paragraphs: [
            'Zenith 的发布系统由 GitHub Actions 驱动，核心是两个工作流：Release Train（手动触发）和 Nightly Release（自动调度）。Release Train 按 Bamboo → Lotus → Bodhi 的顺序链式发布，每个步骤验证上游依赖可用后才继续。',
            '版本管理集中在 release-train.config.json 中，统一控制 Bamboo、Lotus、Bodhi 的版本号。Nightly Release 每天 UTC 04:00 自动计算新版本（格式 YYYY.M.N），更新配置并触发 Release Train。',
          ],
          bullets: [
            'Release Train：链式发布 Bamboo → Lotus → Bodhi，自动验证依赖',
            'Nightly Release：每日自动版本计算（YYYY.M.N 格式）和发布',
            '发布门禁：cargo test、type-check、clippy、lint 全部通过',
            '版本统一：release-train.config.json 集中管理三仓库版本',
            '故障处理：支持手动重试、跳过测试、版本回滚',
          ],
        },
      ],
    },
    docs: {
      kicker: 'BODHI DOCUMENTATION',
      title: 'Bodhi 文档中心',
      description:
        '先用 Bodhi 理解体验，再沿着 Bamboo / Lotus / workflow / schedule 逐步深入。本文档页聚焦上手路径、能力边界与开发者入口。',
      updatedLabel: '最近更新',
      tocTitle: '文档目录',
      sections: [
        {
          id: 'overview',
          title: '概览',
          paragraphs: [
            'Bodhi 是主产品形态；Lotus 是它的交互层；Bamboo 是本地 Agent runtime 与执行引擎。这个分工让产品、能力和架构都更容易被用户理解。',
            '如果你是第一次接触，建议先从"第一次运行"开始；如果你已经把 Bodhi 当成长期工具，再继续阅读进阶玩法和开发者章节。',
          ],
          bullets: ['首页：价值表达与转化入口', '文档：上手、扩展、集成', 'Bodhi 产品 → Bamboo 引擎 → Lotus 界面'],
        },
        {
          id: 'first-run',
          title: '第一次运行',
          paragraphs: [
            '第一次使用 Bodhi 的目标，是跑通一个"从打开到完成任务"的闭环。桌面端会优先承担引导式设置：检测网络环境、配置 Provider、确认基础选项。',
            '先从最小可用路径开始，确认流程有效后，再逐步启用 MCP、workflow 和 schedules。',
          ],
          bullets: ['先完成桌面引导', '先跑通一个任务，再考虑深度配置', '优先让第一次体验足够顺畅'],
          code: quickstartCode,
        },
        {
          id: 'power-users',
          title: '进阶玩法',
          paragraphs: [
            '当你把 Bodhi 当成日常工作的一部分时，真正的价值来自可扩展与可复用能力。Provider 负责模型接入；MCP 负责能力外扩；Workflow 负责复用；Schedule 负责自动化。',
            '最佳路径：先把一个有效任务跑通，再提炼成稳定工作流，最后加入 Schedule。',
          ],
          bullets: ['Provider：统一模型能力入口', 'MCP：把外部系统接进来', 'Workflow + Schedule：把成功经验沉淀成长期机制'],
        },
        {
          id: 'architecture',
          title: '架构与职责边界',
          paragraphs: [
            'Bodhi 负责桌面外壳、引导和交付；Lotus 负责 React + Vite 交互层；Bamboo 负责本地执行、API、工具系统与自动化能力。',
            'Lotus 或 Bodhi 会调用 Bamboo 的 `/api/v1/*` 端点，并通过 `/api/v1/events/{session_id}` 接收流式事件。',
          ],
          bullets: ['Bodhi：产品入口', 'Lotus：实时 UI 层', 'Bamboo：本地 Agent runtime', 'Pavilion：官网与知识入口'],
        },
        {
          id: 'automation',
          title: '自动化思路',
          paragraphs: [
            'Bodhi 的长期价值不只是一次任务成功，而是把高频动作逐步沉淀成系统能力。Workflow 适合保存多步骤流程；Schedule 适合定时运行。',
            '两者结合后，Bodhi 从"会话型工具"变成"持续协作者"。',
          ],
          bullets: ['先验证单次任务有效', '再保存为 Workflow', '最后用 Schedule 建立固定节奏'],
        },
        {
          id: 'developers',
          title: '开发者入口',
          paragraphs: [
            '最重要的是先理解三层边界：Bodhi 是桌面壳，Lotus 是 UI 资产源，Bamboo 是运行时与 API 核心。按职责直接进入对应项目。',
            '前端重点关注 Lotus 的事件订阅与多窗格结构；后端关注 Bamboo 的路由、工具能力、调度与 MCP 管理；桌面发布与原生集成在 Bodhi。',
          ],
          bullets: ['桌面壳看 Bodhi，前端交互看 Lotus，执行面看 Bamboo', '按公开职责边界理解项目', '官网与真实产品边界保持一致'],
          code: repoGuideCode,
        },
        {
          id: 'api',
          title: '关键 API',
          paragraphs: [
            '对于前端、桌面端和自动化脚本来说，最关键的是会话执行、事件流、MCP 管理以及 schedule 相关端点。',
          ],
          code: apiCode,
        },
        {
          id: 'bodhi-server',
          title: 'Bodhi Server (后端服务)',
          paragraphs: [
            'Bodhi Server 是 Zenith 栈的后端 API 服务层，采用 Go 语言编写，负责处理认证、数据持久化和跨平台服务端能力。它为 Bamboo runtime 提供补充性的服务端能力，特别是在需要中心化数据管理和用户认证的场景下。',
            'Bodhi Server 独立于桌面端运行，通过 RESTful API 与客户端通信。它使用 PostgreSQL 作为数据存储，JWT 进行认证，支持 Docker 部署和容器化运行。',
          ],
          bullets: [
            'Go 后端服务：高性能、低内存占用、易于部署',
            'JWT 认证：安全的用户认证和会话管理',
            'PostgreSQL 持久化：可靠的数据存储和查询',
            'Docker 支持：docker-compose 一键启动',
            '独立部署：可作为中心化服务为多个客户端提供能力',
          ],
        },
        {
          id: 'cicd',
          title: 'CI/CD 与发布系统',
          paragraphs: [
            'Zenith 采用全自动化的 CI/CD 流程管理 Bamboo、Lotus、Bodhi 三个仓库的协同发布。Release Train 工作流串联 Bamboo → Lotus → Bodhi 的发布顺序，确保依赖关系正确处理。',
            'Nightly Release 每天自动计算并发布新版本。版本号遵循 YYYY.M.N 格式（如 2026.4.29），当月份变化时 N 重置为 1。Release Train 会自动验证 crates.io 和 npm 上的包可用性后才继续下一步。',
          ],
          bullets: [
            'Release Train：一键触发 Bamboo → Lotus → Bodhi 的链式发布',
            'Nightly Release：每日自动版本计算和发布调度',
            '版本统一管理：release-train.config.json 集中管理三个仓库的版本号',
            '发布前验证：自动检查 crates.io 和 npm 包可用性',
            '回滚机制：支持通过 workflow_dispatch 手动触发指定版本发布',
          ],
        },
        {
          id: 'multi-agent',
          title: '多 Agent 协作',
          paragraphs: [
            'Zenith 使用 GitHub Projects "Zenith Roadmap" 来协调多个 agent 在并行工作时避免冲突。每个 agent 通过认领任务、更新看板状态、提交 PR 的方式参与协作。',
            '工作流遵循 Backlog → Triaged → Ready → In Progress → In Review → Done 的看板流程。同一模块最多允许 2 个 agent 同时工作，跨模块任务需要串行处理。',
          ],
          bullets: [
            'GitHub Projects 看板：可视化任务状态和优先级',
            '任务认领机制：通过评论标记 claimed by <agent-id>',
            '分支命名规范：<module>/<type>/<issue-number>-<short-desc>',
            '并行约束：同模块最多 2 个 agent，跨模块任务串行',
            '代码审查：agent 可跨模块互审，最终需要人工合并',
          ],
        },
        {
          id: 'security',
          title: '安全与测试',
          paragraphs: [
            'Zenith 栈重视工程安全和代码质量。Bamboo 使用 rustls-webpki 进行 TLS 证书验证，已修复潜在的安全漏洞。Bodhi Server 包含完整的单元测试覆盖（internal/config 包）。',
            '发布流程中包含安全审查检查点，所有代码变更需通过 cargo clippy、单元测试和类型检查才能进入发布候选。',
          ],
          bullets: [
            'TLS 安全：rustls-webpki 用于安全的 TLS 连接',
            '单元测试：Bodhi Server internal/config 包已覆盖测试',
            '代码质量：cargo fmt、clippy、Prettier 强制格式化',
            '发布门禁：测试通过、版本验证、安全检查后方可发布',
            '依赖审计：定期更新子模块以包含安全修复',
          ],
        },
      ],
    },
    footer: {
      home: 'Bodhi · Local AI agent powered by Bamboo and Lotus',
      docs: 'Bodhi Docs · Setup, extension paths, and developer entry points',
    },
  },
  en: {
    meta: {
      homeTitle: 'Bodhi AI · Desktop AI agent workbench',
      docsTitle: 'Bodhi AI Docs · Setup, automation, and developer paths',
      featuresTitle: 'Bodhi AI Features · Desktop workbench, runtime, and automation',
    },
    nav: {
      brand: 'Bodhi AI',
      brandTagline: 'AI that actually works',
      highlights: 'Why Bodhi',
      features: 'Features',
      download: 'Download',
      faq: 'FAQ',
      docs: 'Docs',
      github: 'GitHub',
      home: 'Home',
      overview: 'Overview',
      firstRun: 'First run',
      powerUsers: 'Power users',
      developers: 'Developers',
      api: 'API',
      bodhiServer: 'Bodhi Server',
      cicd: 'CI/CD',
      multiAgent: 'Multi-Agent',
      security: 'Security',
      language: 'Language',
    },
    hero: {
      kicker: 'BODHI AI',
      title: 'Desktop AI that does more than chat',
      subtitle:
        'Bodhi combines structured execution, visible processes, and long-term automation into a desktop AI product that actually keeps work moving — it breaks down tasks, calls tools, and compounds successful runs into repeatable systems.',
      primaryCta: 'Download Bodhi',
      secondaryCta: 'Quick start',
      chips: ['Actually works', 'Visible by default', 'Compounds over time'],
      stats: [
        { value: 'Rust Runtime', label: 'Structured local execution powered by Bamboo' },
        { value: 'Visible', label: 'Tasks, tools, and event streams stay legible' },
        { value: 'Compounds', label: 'Successful runs become workflows and schedules' },
      ],
      liveLabel: 'Live task stream',
      liveTitle: 'AI that moves tasks, not just replies',
      liveSummary:
        'Bodhi gives AI a product surface, Lotus makes the process visible, and Bamboo gives execution a spine. What you see is not chat — it is a working desktop AI system.',
      liveBadges: ['Bodhi Desktop', 'Lotus UI', 'Bamboo Runtime', 'MCP Tools'],
      liveTimeline: [
        { time: '00:00', title: 'Goal received: prepare weekly summary and draft report', state: 'done' },
        { time: '00:03', title: 'Task plan created and streamed back', state: 'done' },
        { time: '00:08', title: 'MCP connected and execution keeps moving', state: 'live' },
        { time: '00:14', title: 'Result prepared, next run handed to automation', state: 'queued' },
      ],
    },
    highlights: {
      kicker: 'WHY BODHI',
      title: 'More than another chat AI',
      items: [
        {
          title: 'Actually executes',
          description: 'Not just generating answers — it breaks tasks into steps, calls tools, and keeps pushing work forward until the goal is met.',
          points: ['Breaks goals into executable steps', 'Calls built-in tools and MCP extensions', 'Maintains task state through completion'],
        },
        {
          title: 'Visible by default',
          description: 'Task status, tool calls, and event streams are visible in real time. You always know what the AI is doing and where things stand.',
          points: ['SSE-driven live event stream', 'Full visibility into tasks and tools', 'State changes stay trackable'],
        },
        {
          title: 'Compounds over time',
          description: 'Successful runs become Workflows and Schedules. The more you use Bodhi, the more it understands your work patterns.',
          points: ['Workflows preserve successful patterns', 'Schedules create automation rhythm', 'Long-term use creates lasting leverage'],
        },
      ],
    },
    showcase: {
      kicker: 'PRODUCT',
      title: 'Real product surfaces, not concept art',
      panels: [
        {
          kicker: 'System Settings',
          title: 'Unified settings center',
          badge: 'Settings',
          imageSrc: '/screenshots/bodhi-system-settings-provider.png',
          imageAlt: 'Bodhi System Settings screenshot',
        },
        {
          kicker: 'MCP',
          title: 'MCP extensibility',
          badge: 'MCP',
          imageSrc: '/screenshots/bodhi-mcp.png',
          imageAlt: 'Bodhi MCP screenshot',
        },
        {
          kicker: 'Metrics',
          title: 'Usage analytics',
          badge: 'Metrics',
          imageSrc: '/screenshots/bodhi-metrics.png',
          imageAlt: 'Bodhi Metrics screenshot',
        },
      ],
    },
    capabilities: {
      kicker: 'CAPABILITIES',
      title: 'Four core capabilities',
      items: [
        {
          kicker: '01',
          title: 'Desktop workbench',
          description: 'Install, setup, providers, env vars, skills, and metrics — all in one desktop interface.',
          points: ['Desktop-first entry point', 'Guided first-run setup', 'Complete product experience'],
          featureId: 'desktop',
        },
        {
          kicker: '02',
          title: 'Structured runtime',
          description: 'Bamboo provides a local Rust runtime that organizes tasks, tools, memory, and scheduling into an execution core.',
          points: ['Local Rust execution core', 'Context and memory integrated', 'Full HTTP API coverage'],
          featureId: 'runtime',
        },
        {
          kicker: '03',
          title: 'Visible execution',
          description: 'Tasks, tool calls, event streams, and state changes stay visible — even long-running work stays legible.',
          points: ['SSE live feedback', 'Task progress visualization', 'Transparent tool invocations'],
          featureId: 'visible',
        },
        {
          kicker: '04',
          title: 'Automation system',
          description: 'MCP extends capability boundaries, Workflows preserve successful runs, Schedules create long-term automation rhythm.',
          points: ['MCP Server extensibility', 'Workflow reuse', 'Schedule recurring execution'],
          featureId: 'automation',
        },
      ],
    },
    faq: {
      kicker: 'FAQ',
      title: 'Common questions',
      items: [
        {
          question: 'How do Bodhi, Bamboo, and Lotus relate?',
          answer:
            'Bodhi is the desktop product, Lotus is the UI interaction layer, and Bamboo is the local Agent runtime. Together they form a complete desktop AI system.',
        },
        {
          question: 'Is Bodhi just a chat interface?',
          answer:
            'No. It executes tasks, shows live progress, calls tools, connects MCP servers, saves workflows, and automates repeatable work with schedules.',
        },
        {
          question: 'Where should I start?',
          answer:
            'Start with the Bodhi desktop app. Or read the First run section in docs to understand setup before installing.',
        },
        {
          question: 'Where should developers begin?',
          answer:
            'Desktop shell → Bodhi, frontend interactions → Lotus, execution engine → Bamboo. The docs page is organized around these three layers.',
        },
        {
          question: 'What makes Bodhi different from other agent products?',
          answer:
            'Bodhi is not just a UI layer around a model. It is built on Bamboo, a local Rust runtime with its own execution path, context memory, tool system, and automation capabilities — all wrapped in a real desktop product.',
        },
      ],
    },
    download: {
      primaryCta: 'Download Bodhi',
      secondaryCta: 'Quick start',
      githubCta: 'GitHub',
    },
    features: {
      kicker: 'FEATURES',
      title: 'Feature guide',
      description: 'Explore every core capability of Bodhi — from the desktop product experience to the execution engine underneath.',
      updatedLabel: 'Last updated',
      tocTitle: 'Feature map',
      sections: [
        {
          id: 'desktop',
          title: 'Desktop workbench',
          paragraphs: [
            'Bodhi is the desktop product entry point. After installation, you get a real desktop application — not a CLI loop, not a web chat wrapper, but a product with a settings center, skill management, environment variable configuration, and usage analytics.',
            'On first launch, Bodhi guides you through provider configuration, network detection, and basic setup to minimize friction.',
          ],
          bullets: [
            'Guided first-run setup: network checks, provider config, basic options',
            'Unified settings center: providers, capabilities, and runtime boundaries',
            'Environment variable management: injection, secret handling, and local execution context',
            'Skill system: browsable, searchable capability layer',
            'Usage metrics: historical summaries and efficiency signals',
          ],
          imageSrc: '/screenshots/bodhi-system-settings-provider.png',
          imageAlt: 'Bodhi desktop settings center',
        },
        {
          id: 'runtime',
          title: 'Structured runtime (Bamboo)',
          paragraphs: [
            'Bamboo is Bodhi\'s execution engine — a local Rust runtime that organizes task scheduling, tool systems, context memory, and extensibility into a real execution core.',
            'It does not rely on third-party agent frameworks. Instead, it owns its execution path: from receiving a goal, creating tasks, calling tools, to producing results, saving context, and triggering follow-up automation.',
          ],
          bullets: [
            'Local Rust runtime: high performance, low latency, fully local execution',
            'Task system: goal decomposition, step management, state tracking',
            'Tool system: built-in tools (file ops, command execution, HTTP requests, etc.)',
            'Context and memory: long tasks preserve context, cross-session memory',
            'HTTP API: complete RESTful interface for frontend, desktop, and automation scripts',
            'SSE event stream: real-time execution progress, tool calls, and state changes',
          ],
          code: apiCode,
        },
        {
          id: 'visible',
          title: 'Visible execution (Lotus)',
          paragraphs: [
            'Lotus is Bodhi\'s UI interaction layer, making the agent\'s execution process truly visible. You do not wait for a black box to return — task progress, tool calls, and state changes are all rendered in real time.',
            'Built on SSE (Server-Sent Events), every execution step is trackable as it happens.',
          ],
          bullets: [
            'Live event stream: SSE-driven real-time task progress',
            'Task state visualization: each step\'s status (queued, running, done) is clear',
            'Transparent tool calls: see what tools the AI called, with what parameters, and what results',
            'Multi-pane interaction: view conversation, tool output, and task state simultaneously',
            'Session management: historical sessions are traceable and reusable',
          ],
          imageSrc: '/screenshots/bodhi-workbench.png',
          imageAlt: 'Bodhi workbench interface',
        },
        {
          id: 'mcp',
          title: 'MCP and extensions',
          paragraphs: [
            'MCP (Model Context Protocol) lets Bodhi\'s capability boundary grow continuously. By connecting MCP servers, you can integrate external tools, data sources, and systems into the execution path.',
            'Bodhi provides visual MCP server management: add, configure, connect, and refresh — all from the settings center.',
          ],
          bullets: [
            'MCP server management: add, configure, connect, disconnect, refresh',
            'MCP server import: batch import MCP configurations',
            'Tool discovery: automatically discover tools from connected MCP servers',
            'Provider-compatible endpoints: supports OpenAI, Anthropic, Gemini prefixes',
          ],
          imageSrc: '/screenshots/bodhi-mcp.png',
          imageAlt: 'Bodhi MCP management interface',
        },
        {
          id: 'automation',
          title: 'Workflows and schedules',
          paragraphs: [
            'Bodhi\'s long-term value is not just one successful run — it is turning repeated work into durable system behavior. Workflows save multi-step execution patterns. Schedules make those patterns run on cadence.',
            'Best path: prove one task works → save as Workflow → add Schedule for recurring execution.',
          ],
          bullets: [
            'Workflows: save successful multi-step patterns for one-click reuse',
            'Schedules: run Workflows automatically on a cadence',
            'Session management: view history, trace back, and reuse past executions',
            'Execution history: complete run records and result tracking',
          ],
          imageSrc: '/screenshots/bodhi-overview.png',
          imageAlt: 'Bodhi automation overview',
        },
        {
          id: 'skills',
          title: 'Skill system',
          paragraphs: [
            'The skill system presents Bodhi\'s capabilities as a browsable, searchable catalog. Each skill represents a concrete product capability — from file operations to code execution, from HTTP requests to data analysis.',
          ],
          bullets: [
            'Browsable skill catalog',
            'Searchable capability index',
            'Skill execution state tracking',
          ],
          imageSrc: '/screenshots/bodhi-skills.png',
          imageAlt: 'Bodhi skill system',
        },
        {
          id: 'architecture',
          title: 'Technical architecture',
          paragraphs: [
            'Bodhi uses a three-layer architecture: Bodhi (desktop shell) handles product entry and native integration; Lotus (React + Vite) handles the UI interaction layer; Bamboo (Rust) handles local execution and API services.',
            'The frontend communicates with the runtime through Bamboo\'s `/api/v1/*` endpoints and receives live event streams via `/api/v1/events/{session_id}`.',
          ],
          bullets: [
            'Bodhi: desktop install, guided setup, native integration, release delivery',
            'Lotus: React + Vite interaction layer, SSE live rendering, settings center',
            'Bamboo: Rust runtime, HTTP API, built-in tools, MCP, workflows, schedules',
            'Bodhi Server: Go backend service, authentication, data persistence, Docker deployment',
            'Pavilion: website and documentation entry point',
          ],
          code: repoGuideCode,
        },
        {
          id: 'bodhi-server',
          title: 'Bodhi Server Backend',
          paragraphs: [
            'Bodhi Server is the server-side component of the Zenith stack, implemented in Go. It provides complementary server-side capabilities to the Bamboo runtime, handling user authentication, data persistence, and centralized business logic.',
            'Unlike Bamboo\'s local execution, Bodhi Server is designed as an independently deployable service. It exposes capabilities via RESTful APIs, uses PostgreSQL for data storage, JWT for authentication, and fully supports containerized deployment.',
          ],
          bullets: [
            'Go implementation: high performance, compiled, low resource usage',
            'JWT authentication: secure auth based on golang-jwt/jwt/v5',
            'PostgreSQL: database access via jackc/pgx/v5',
            'Docker support: Dockerfile + docker-compose.yml for one-command deployment',
            'Test coverage: internal/config package has complete unit tests',
          ],
        },
        {
          id: 'cicd',
          title: 'Release & Automation',
          paragraphs: [
            'Zenith\'s release system is driven by GitHub Actions, centered around two workflows: Release Train (manual trigger) and Nightly Release (automatic scheduling). Release Train chains releases in the order Bamboo → Lotus → Bodhi, verifying upstream dependencies are available before continuing.',
            'Version management is centralized in release-train.config.json, uniformly controlling versions for Bamboo, Lotus, and Bodhi. Nightly Release automatically calculates new versions (YYYY.M.N format) daily at UTC 04:00, updates the config, and triggers Release Train.',
          ],
          bullets: [
            'Release Train: chained release Bamboo → Lotus → Bodhi with dependency validation',
            'Nightly Release: automatic version calculation (YYYY.M.N format) and daily publishing',
            'Release gates: cargo test, type-check, clippy, lint must all pass',
            'Unified versions: release-train.config.json centrally manages three-repository versions',
            'Failure handling: supports manual retry, test skipping, and version rollback',
          ],
        },
      ],
    },
    docs: {
      kicker: 'BODHI DOCUMENTATION',
      title: 'Bodhi documentation hub',
      description:
        'Start from the Bodhi experience, then move deeper into Bamboo, Lotus, workflows, schedules, and developer boundaries. This page keeps the product story and technical path aligned.',
      updatedLabel: 'Last updated',
      tocTitle: 'Documentation map',
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          paragraphs: [
            'Bodhi is the product surface. Lotus is the interaction layer. Bamboo is the local runtime and execution engine. This separation makes the product, its capabilities, and its architecture easier to understand.',
            'If you are new, start with first run. If Bodhi is already part of your workflow, continue into automation and developer sections.',
          ],
          bullets: ['Home: positioning and conversion', 'Docs: setup, automation, integration', 'Bodhi → Bamboo → Lotus'],
        },
        {
          id: 'first-run',
          title: 'First run',
          paragraphs: [
            'The first Bodhi experience focuses on closing one loop from launch to a completed task. The desktop app leads with guided setup: network checks, provider configuration, and a minimal path into the main interface.',
            'Start with the smallest useful path. Once one task works, add MCP, workflows, and schedules incrementally.',
          ],
          bullets: ['Finish desktop onboarding first', 'Validate one useful task before deep configuration', 'Optimize for a low-friction first experience'],
          code: quickstartCode,
        },
        {
          id: 'power-users',
          title: 'Power-user path',
          paragraphs: [
            'When Bodhi becomes part of daily work, real leverage comes from structure, extensibility, and reuse. Providers expand model access. MCP extends capability boundaries. Workflows preserve successful executions. Schedules add cadence.',
            'Best progression: prove one task → turn it into a workflow → add schedules when stable.',
          ],
          bullets: ['Providers widen model access', 'MCP connects outside systems', 'Workflows + schedules turn success into repeatable automation'],
        },
        {
          id: 'architecture',
          title: 'Architecture and boundaries',
          paragraphs: [
            'Bodhi owns desktop packaging and native integration. Lotus owns the React + Vite interaction layer. Bamboo owns execution, APIs, built-in tools, and automation.',
            'Lotus or Bodhi call Bamboo `/api/v1/*` endpoints and subscribe to `/api/v1/events/{session_id}` for live events.',
          ],
          bullets: ['Bodhi: product entry point', 'Lotus: visible UI layer', 'Bamboo: local agent runtime', 'Pavilion: website and knowledge surface'],
        },
        {
          id: 'automation',
          title: 'Automation mindset',
          paragraphs: [
            'Long-term value is not one successful run. It is turning repeated work into durable system behavior. Workflows save multi-step patterns. Schedules run them on cadence. Together, they move Bodhi from session tool to continuing collaborator.',
          ],
          bullets: ['Prove a task first', 'Save it as a workflow', 'Add a schedule when the pattern is stable'],
        },
        {
          id: 'developers',
          title: 'Developer entry',
          paragraphs: [
            'First priority: understand the ownership boundary. Bodhi is the desktop shell, Lotus is the UI source, Bamboo is the runtime plus API core. Enter the layer you need directly.',
            'Frontend work centers on Lotus streaming, multi-pane behavior, and settings. Backend work centers on Bamboo routes, tools, memory, scheduling, and MCP. Desktop packaging lives in Bodhi.',
          ],
          bullets: ['Bodhi for desktop, Lotus for UI, Bamboo for runtime', 'Use public boundaries as the main mental model', 'Keep website messaging aligned with the real product'],
          code: repoGuideCode,
        },
        {
          id: 'api',
          title: 'Key APIs',
          paragraphs: [
            'For frontend clients, desktop behavior, and automation scripts, the most important surfaces are runtime execution, event streaming, MCP management, and schedules.',
          ],
          code: apiCode,
        },
        {
          id: 'bodhi-server',
          title: 'Bodhi Server (Backend Service)',
          paragraphs: [
            'Bodhi Server is the backend API service layer of the Zenith stack, written in Go. It handles authentication, data persistence, and cross-platform server-side capabilities. It complements the Bamboo runtime with centralized data management and user authentication.',
            'Bodhi Server runs independently from the desktop client, communicating via RESTful APIs. It uses PostgreSQL for data storage, JWT for authentication, and supports Docker deployment with docker-compose.',
          ],
          bullets: [
            'Go backend service: high performance, low memory footprint, easy to deploy',
            'JWT authentication: secure user authentication and session management',
            'PostgreSQL persistence: reliable data storage and querying',
            'Docker support: one-command startup with docker-compose',
            'Independent deployment: can serve multiple clients as a centralized service',
          ],
        },
        {
          id: 'cicd',
          title: 'CI/CD & Release System',
          paragraphs: [
            'Zenith uses a fully automated CI/CD pipeline to manage coordinated releases across Bamboo, Lotus, and Bodhi repositories. The Release Train workflow orchestrates releases in the order Bamboo → Lotus → Bodhi, ensuring dependency relationships are handled correctly.',
            'Nightly Release automatically calculates and publishes new versions daily. Version numbers follow the YYYY.M.N format (e.g., 2026.4.29), with N resetting to 1 when the month changes. The Release Train validates package availability on crates.io and npm before proceeding to the next step.',
          ],
          bullets: [
            'Release Train: one-click chained release of Bamboo → Lotus → Bodhi',
            'Nightly Release: automatic version calculation and daily release scheduling',
            'Unified version management: release-train.config.json centrally manages versions for all three repositories',
            'Pre-release validation: automatic checks for crates.io and npm package availability',
            'Rollback support: manual workflow_dispatch triggers for specific versions',
          ],
        },
        {
          id: 'multi-agent',
          title: 'Multi-Agent Collaboration',
          paragraphs: [
            'Zenith uses GitHub Projects "Zenith Roadmap" to coordinate multiple agents working in parallel without conflicts. Each agent participates by claiming tasks, updating board status, and submitting PRs.',
            'The workflow follows a kanban process: Backlog → Triaged → Ready → In Progress → In Review → Done. A maximum of 2 agents can work on the same module simultaneously, while cross-module tasks must be serialized.',
          ],
          bullets: [
            'GitHub Projects board: visual task status and priority management',
            'Task claiming: mark tasks with "claimed by <agent-id>" comments',
            'Branch naming convention: <module>/<type>/<issue-number>-<short-desc>',
            'Parallel constraints: max 2 agents per module, cross-module tasks serialized',
            'Code review: agents can cross-review across modules, human merges required',
          ],
        },
        {
          id: 'security',
          title: 'Security & Testing',
          paragraphs: [
            'The Zenith stack prioritizes engineering security and code quality. Bamboo uses rustls-webpki for TLS certificate verification, with security vulnerabilities promptly patched. Bodhi Server includes comprehensive unit test coverage (internal/config package).',
            'The release process includes security review checkpoints. All code changes must pass cargo clippy, unit tests, and type checks before becoming release candidates.',
          ],
          bullets: [
            'TLS security: rustls-webpki for secure TLS connections',
            'Unit tests: Bodhi Server internal/config package has test coverage',
            'Code quality: cargo fmt, clippy, Prettier enforced formatting',
            'Release gates: tests pass, version validated, security checks cleared before release',
            'Dependency auditing: regular submodule updates to include security fixes',
          ],
        },
      ],
    },
    footer: {
      home: 'Bodhi · Local AI agent powered by Bamboo and Lotus',
      docs: 'Bodhi Docs · Setup, extension paths, and developer entry points',
    },
  },
}

function getInitialLocale(): Locale {
  const queryLocale = new URLSearchParams(window.location.search).get('lang')
  if (queryLocale === 'zh' || queryLocale === 'en') {
    return queryLocale
  }

  const storedLocale = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (storedLocale === 'zh' || storedLocale === 'en') {
    return storedLocale
  }

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function buildUrl(pathname: string, locale: Locale, hash?: string): string {
  const suffix = hash ? `#${hash}` : ''
  return `${pathname}?lang=${locale}${suffix}`
}

function useReveal<T extends HTMLElement>(startVisible = false) {
  const elementRef = useRef<T | null>(null)
  const [isVisible, setIsVisible] = useState(startVisible)

  useEffect(() => {
    if (startVisible) {
      return
    }

    const node = elementRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.22 },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [startVisible])

  return { elementRef, isVisible }
}

function LanguageSwitch({
  locale,
  onChange,
  label,
}: {
  locale: Locale
  onChange: (locale: Locale) => void
  label: string
}) {
  return (
    <div className="locale-switch" role="group" aria-label={label}>
      <button
        className={locale === 'zh' ? 'locale-button active' : 'locale-button'}
        type="button"
        onClick={() => onChange('zh')}
      >
        中文
      </button>
      <button
        className={locale === 'en' ? 'locale-button active' : 'locale-button'}
        type="button"
        onClick={() => onChange('en')}
      >
        EN
      </button>
    </div>
  )
}

function SectionIntro({
  kicker,
  title,
  description,
}: {
  kicker: string
  title: string
  description?: string
}) {
  return (
    <div className="section-intro">
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  )
}

function RevealSection({
  id,
  className,
  startVisible = false,
  children,
}: {
  id?: string
  className: string
  startVisible?: boolean
  children: React.ReactNode
}) {
  const { elementRef, isVisible } = useReveal<HTMLElement>(startVisible)

  return (
    <section
      id={id}
      ref={elementRef}
      className={`section-shell ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </section>
  )
}

function HomePage({
  locale,
  setLocale,
  content,
}: {
  locale: Locale
  setLocale: (locale: Locale) => void
  content: Translation
}) {
  const downloadUrl = buildUrl('/download', locale)
  const docsFirstRunUrl = buildUrl('/docs', locale, 'first-run')
  const docsUrl = buildUrl('/docs', locale, 'overview')
  const featuresUrl = buildUrl('/features', locale)

  return (
    <div className="page-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="top-nav panel">
        <a className="brand-lockup" href={buildUrl('/', locale)}>
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>{content.nav.brand}</strong>
            <small>{content.nav.brandTagline}</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#why-bodhi">{content.nav.highlights}</a>
          <a href={featuresUrl}>{content.nav.features}</a>
          <a href={downloadUrl}>{content.nav.download}</a>
          <a href="#faq">{content.nav.faq}</a>
          <a href={docsUrl}>{content.nav.docs}</a>
          <a href={BODHI_GITHUB_URL} target="_blank" rel="noopener noreferrer">
            {content.nav.github}
          </a>
        </nav>

        <LanguageSwitch locale={locale} onChange={setLocale} label={content.nav.language} />
      </header>

      <main className="home-main">
        <RevealSection className="panel hero-panel" startVisible>
          <div className="hero-copy">
            <p className="hero-kicker">{content.hero.kicker}</p>
            <h1>{content.hero.title}</h1>
            <p className="hero-subtitle">{content.hero.subtitle}</p>

            <div className="chip-row" aria-label="Product highlights">
              {content.hero.chips.map((chip) => (
                <span className="chip" key={chip}>
                  {chip}
                </span>
              ))}
            </div>

            <div className="hero-actions">
              <a className="button button-primary" href={downloadUrl}>
                {content.download.primaryCta}
              </a>
              <a className="button button-secondary" href={docsFirstRunUrl}>
                {content.download.secondaryCta}
              </a>
              <a
                className="link-inline hero-link-inline"
                href={BODHI_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.download.githubCta}
              </a>
            </div>

            <dl className="hero-stats">
              {content.hero.stats.map((stat) => (
                <div className="panel-subtle stat-card" key={stat.value}>
                  <dd>{stat.value}</dd>
                  <dt>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <aside className="live-panel panel-subtle" aria-label={content.hero.liveLabel}>
            <div className="live-panel-head">
              <span className="live-pill">{content.hero.liveLabel}</span>
              <span className="live-signal">SSE</span>
            </div>

            <div className="hero-product-shot">
              <div className="hero-product-topbar">
                <span className="hero-product-chip">Bodhi Desktop</span>
                <span className="hero-product-chip hero-product-chip-live">Live execution</span>
              </div>
              <img
                className="hero-product-image"
                src="/screenshots/bodhi-system-settings-provider.png"
                alt={locale === 'zh' ? 'Bodhi System Settings 界面截图' : 'Bodhi System Settings screenshot'}
                loading="eager"
              />
              <div className="hero-product-inset">
                <img
                  className="hero-product-inset-image"
                  src="/screenshots/bodhi-skills.png"
                  alt={locale === 'zh' ? 'Bodhi Skills 界面截图' : 'Bodhi skills inset'}
                  loading="lazy"
                />
              </div>
              <div className="hero-product-caption">
                <strong>{locale === 'zh' ? '真实 Bodhi 功能中心' : 'Real Bodhi control surface'}</strong>
                <span>
                  {locale === 'zh'
                    ? '本地运行、设置中心与技能系统都已经是完整产品界面'
                    : 'Local-first, fully configurable, real product surfaces'}
                </span>
              </div>
            </div>

            <h2>{content.hero.liveTitle}</h2>
            <p className="live-summary">{content.hero.liveSummary}</p>

            <div className="badge-row" aria-label="Stack badges">
              {content.hero.liveBadges.map((badge) => (
                <span className="badge" key={badge}>
                  {badge}
                </span>
              ))}
            </div>

            <div className="timeline">
              {content.hero.liveTimeline.map((event) => (
                <div className="timeline-item" key={`${event.time}-${event.title}`}>
                  <span className={`status-dot status-${event.state}`} aria-hidden="true" />
                  <span className="timeline-time">{event.time}</span>
                  <p>{event.title}</p>
                </div>
              ))}
            </div>
          </aside>
        </RevealSection>

        <RevealSection id="why-bodhi" className="panel section-card highlights-section">
          <SectionIntro
            kicker={content.highlights.kicker}
            title={content.highlights.title}
          />

          <div className="highlights-grid">
            {content.highlights.items.map((item) => (
              <article className="panel-subtle highlight-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="panel section-card showcase-section">
          <SectionIntro
            kicker={content.showcase.kicker}
            title={content.showcase.title}
          />

          <div className="showcase-grid">
            {content.showcase.panels.map((panel, index) => (
              <article className={`panel-subtle showcase-card ${index === 0 ? 'featured' : ''}`} key={panel.title}>
                <div className="showcase-media">
                  <img className="showcase-image" src={panel.imageSrc} alt={panel.imageAlt} loading="lazy" />
                </div>
                <div className="showcase-head">
                  <p className="card-kicker">{panel.kicker}</p>
                  <span className="showcase-badge">{panel.badge}</span>
                </div>
                <h3>{panel.title}</h3>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="capabilities" className="panel section-card">
          <SectionIntro
            kicker={content.capabilities.kicker}
            title={content.capabilities.title}
          />

          <div className="capability-grid">
            {content.capabilities.items.map((item) => {
              const link = item.featureId
                ? buildUrl('/features', locale, item.featureId)
                : featuresUrl
              return (
                <article className="panel-subtle capability-card" key={item.title}>
                  <p className="card-kicker">{item.kicker}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <a className="link-inline" href={link}>
                    {locale === 'zh' ? '了解更多' : 'Learn more'}
                  </a>
                </article>
              )
            })}
          </div>
        </RevealSection>

        <RevealSection id="faq" className="panel section-card faq-section">
          <SectionIntro
            kicker={content.faq.kicker}
            title={content.faq.title}
          />

          <div className="faq-list">
            {content.faq.items.map((item) => (
              <details className="panel-subtle faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="panel final-cta">
          <div>
            <p className="section-kicker">GET STARTED</p>
            <h2>
              {locale === 'zh'
                ? '从 Bodhi 开始，让 AI 真正替你推进工作'
                : 'Start with Bodhi. Let AI actually move your work forward.'}
            </h2>
          </div>

          <div className="hero-actions final-actions">
            <a className="button button-primary" href={downloadUrl}>
              {content.download.primaryCta}
            </a>
            <a className="button button-secondary" href={docsUrl}>
              {content.download.secondaryCta}
            </a>
          </div>
        </RevealSection>
      </main>

      <footer className="footer-line">
        <p>{content.footer.home}</p>
      </footer>
    </div>
  )
}

function FeaturesPage({
  locale,
  setLocale,
  content,
}: {
  locale: Locale
  setLocale: (locale: Locale) => void
  content: Translation
}) {
  const updatedAt = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="page-shell docs-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="top-nav panel">
        <a className="brand-lockup" href={buildUrl('/', locale)}>
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>{content.nav.brand}</strong>
            <small>{content.nav.brandTagline}</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Features navigation">
          <a href={buildUrl('/', locale)}>{content.nav.home}</a>
          <a href={buildUrl('/download', locale)}>{content.nav.download}</a>
          <a href={buildUrl('/docs', locale)}>{content.nav.docs}</a>
          <a href={BODHI_GITHUB_URL} target="_blank" rel="noopener noreferrer">
            {content.nav.github}
          </a>
        </nav>

        <LanguageSwitch locale={locale} onChange={setLocale} label={content.nav.language} />
      </header>

      <main className="docs-main">
        <section className="panel docs-hero">
          <p className="section-kicker">{content.features.kicker}</p>
          <h1>{content.features.title}</h1>
          <p className="docs-description">{content.features.description}</p>
          <small>
            {content.features.updatedLabel}: {updatedAt}
          </small>
        </section>

        <div className="docs-layout">
          <aside className="panel docs-toc" aria-label={content.features.tocTitle}>
            <h2>{content.features.tocTitle}</h2>
            <ul>
              {content.features.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          <article className="panel docs-content">
            {content.features.sections.map((section) => (
              <section className="doc-section" id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.imageSrc ? (
                  <div className="feature-image-wrap">
                    <img
                      className="feature-image"
                      src={section.imageSrc}
                      alt={section.imageAlt || section.title}
                      loading="lazy"
                    />
                  </div>
                ) : null}
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.id}-p-${paragraphIndex}`}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={`${section.id}-b-${bulletIndex}`}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.code ? (
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="footer-line">
        <p>{content.footer.home}</p>
      </footer>
    </div>
  )
}

function DownloadPage({
  locale,
  setLocale,
  content,
}: {
  locale: Locale
  setLocale: (locale: Locale) => void
  content: Translation
}) {
  const homeUrl = buildUrl('/', locale)
  const downloadUrl = buildUrl('/download', locale)
  const docsOverviewUrl = buildUrl('/docs', locale, 'overview')
  const docsFirstRunUrl = buildUrl('/docs', locale, 'first-run')

  const copy =
    locale === 'zh'
      ? {
          kicker: 'DOWNLOAD BODHI',
          title: '下载 Bodhi AI，开始使用一个真正能持续推进工作的桌面 Agent。',
          description:
            '这是 Bodhi AI 的稳定下载入口。主按钮始终指向 GitHub 最新 release。你下载的不是一个临时聊天套壳，而是建立在 Bamboo 结构化 Rust runtime 之上的桌面工作台。',
          latestKicker: 'Latest release mapping',
          latestTitle: '稳定下载入口：始终指向最新版本',
          latestDescription:
            '无论后续版本怎么迭代，这个入口都可以保持不变。点击主按钮后，GitHub 会自动把用户带到当前最新 release。',
          primaryCta: '下载最新版本',
          secondaryCta: '查看所有 Releases',
          tertiaryCta: '查看快速开始',
          routeNote: '当前映射地址',
          sideKicker: 'Why Bodhi AI',
          sideTitle: '你下载的是一个会工作的 AI 产品',
          sidePoints: [
            '不只回答，会拆任务并推进执行',
            '过程可见，不是黑箱式 agent',
            'workflow 和 schedule 让价值越用越大',
          ],
          screenshotKicker: 'REAL BODHI UI',
          screenshotTitle: '真实的 Bodhi 界面，而不是概念图',
          screenshotDescription:
            '这些截图直接来自真实运行中的 Bodhi。真实产品界面比抽象插画更有说服力。',
          screenshotNote:
            '这组官方截图优先展示设置中心、环境变量、指标、MCP 与技能系统等更能体现产品深度的功能面。',
          screenshots: [
            {
              title: 'System Settings 总览',
              description: '展示 Bodhi 已经具备完整的设置中心。',
              src: '/screenshots/bodhi-system-settings-provider.png',
            },
            {
              title: 'Env Vars',
              description: '环境变量注入和 secret 管理。',
              src: '/screenshots/bodhi-env-vars.png',
            },
            {
              title: 'Metrics',
              description: '使用统计和效率指标。',
              src: '/screenshots/bodhi-metrics.png',
            },
            {
              title: 'MCP',
              description: '外部扩展能力配置界面。',
              src: '/screenshots/bodhi-mcp.png',
            },
            {
              title: 'Skills',
              description: '技能系统浏览和检索。',
              src: '/screenshots/bodhi-skills.png',
            },
          ],
        }
      : {
          kicker: 'DOWNLOAD BODHI',
          title: 'Download Bodhi AI and start with a desktop agent that actually keeps work moving.',
          description:
            'The stable download entry for Bodhi AI. The primary button always points to the latest GitHub release. You are downloading a desktop workbench built on Bamboo\'s structured Rust runtime.',
          latestKicker: 'Latest release mapping',
          latestTitle: 'Stable download entry: always points to the latest release',
          latestDescription:
            'This route stays fixed even as versions ship. The primary CTA hands users off to the current latest GitHub release automatically.',
          primaryCta: 'Download latest release',
          secondaryCta: 'View all releases',
          tertiaryCta: 'Open quick start',
          routeNote: 'Current mapped URL',
          sideKicker: 'Why Bodhi AI',
          sideTitle: 'You are downloading an AI product that actually works',
          sidePoints: [
            'Breaks work into steps and keeps execution moving',
            'Process stays visible, not a black box',
            'Workflows and schedules add value over time',
          ],
          screenshotKicker: 'REAL BODHI UI',
          screenshotTitle: 'Real Bodhi screens instead of concept art',
          screenshotDescription:
            'These images come from a real Bodhi instance. Real product screens prove the product is already working.',
          screenshotNote:
            'This set focuses on deeper surfaces: settings, env vars, metrics, MCP, and skills.',
          screenshots: [
            {
              title: 'System Settings overview',
              description: 'A real settings center, not just a chat entry point.',
              src: '/screenshots/bodhi-system-settings-provider.png',
            },
            {
              title: 'Env Vars',
              description: 'Environment variable management and secret handling.',
              src: '/screenshots/bodhi-env-vars.png',
            },
            {
              title: 'Metrics',
              description: 'Usage analytics and efficiency summaries.',
              src: '/screenshots/bodhi-metrics.png',
            },
            {
              title: 'MCP',
              description: 'External extensibility configuration surface.',
              src: '/screenshots/bodhi-mcp.png',
            },
            {
              title: 'Skills',
              description: 'Browsable, searchable capability layer.',
              src: '/screenshots/bodhi-skills.png',
            },
          ],
        }

  return (
    <div className="page-shell download-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="top-nav panel">
        <a className="brand-lockup" href={homeUrl}>
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>{content.nav.brand}</strong>
            <small>{content.nav.brandTagline}</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Download navigation">
          <a href={homeUrl}>{content.nav.home}</a>
          <a href={downloadUrl}>{content.nav.download}</a>
          <a href={docsOverviewUrl}>{content.nav.docs}</a>
          <a href={BODHI_GITHUB_URL} target="_blank" rel="noopener noreferrer">
            {content.nav.github}
          </a>
        </nav>

        <LanguageSwitch locale={locale} onChange={setLocale} label={content.nav.language} />
      </header>

      <main className="download-main">
        <section className="panel section-card download-hero">
          <SectionIntro kicker={copy.kicker} title={copy.title} description={copy.description} />

          <div className="download-hero-grid">
            <article className="panel-subtle download-latest-card">
              <p className="card-kicker">{copy.latestKicker}</p>
              <h3>{copy.latestTitle}</h3>
              <p>{copy.latestDescription}</p>
              <div className="download-route-note">
                <span>{copy.routeNote}</span>
                <code>{BODHI_LATEST_RELEASE_URL}</code>
              </div>
              <div className="hero-actions release-actions">
                <a
                  className="button button-primary"
                  href={BODHI_LATEST_RELEASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.primaryCta}
                </a>
                <a
                  className="button button-secondary"
                  href={BODHI_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.secondaryCta}
                </a>
                <a className="button button-secondary" href={docsFirstRunUrl}>
                  {copy.tertiaryCta}
                </a>
              </div>
            </article>

            <article className="panel-subtle download-side-card">
              <p className="card-kicker">{copy.sideKicker}</p>
              <h3>{copy.sideTitle}</h3>
              <ul className="download-side-list">
                {copy.sidePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="panel section-card screenshot-section">
          <SectionIntro
            kicker={copy.screenshotKicker}
            title={copy.screenshotTitle}
            description={copy.screenshotDescription}
          />

          <div className="screenshot-grid">
            {copy.screenshots.map((shot, index) => (
              <article
                className={`screenshot-placeholder screenshot-card ${index === 0 ? 'placeholder-wide' : ''}`}
                key={shot.title}
                aria-label={shot.title}
              >
                <div className="screenshot-image-wrap">
                  <img className="screenshot-image" src={shot.src} alt={shot.title} loading="lazy" />
                </div>
                <span className="placeholder-index">{String(index + 1).padStart(2, '0')}</span>
                <strong>{shot.title}</strong>
                <p>{shot.description}</p>
              </article>
            ))}
          </div>

          <p className="download-note screenshot-note">{copy.screenshotNote}</p>
        </section>
      </main>

      <footer className="footer-line">
        <p>{content.footer.home}</p>
      </footer>
    </div>
  )
}

function DocsPage({
  locale,
  setLocale,
  content,
}: {
  locale: Locale
  setLocale: (locale: Locale) => void
  content: Translation
}) {
  const updatedAt = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="page-shell docs-shell">
      <div className="ambient ambient-a" aria-hidden="true" />
      <div className="ambient ambient-b" aria-hidden="true" />
      <div className="ambient ambient-c" aria-hidden="true" />

      <header className="top-nav panel">
        <a className="brand-lockup" href={buildUrl('/', locale)}>
          <span className="brand-mark">B</span>
          <span className="brand-copy">
            <strong>{content.nav.brand}</strong>
            <small>{content.nav.brandTagline}</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Documentation navigation">
          <a href={buildUrl('/', locale)}>{content.nav.home}</a>
          <a href={buildUrl('/download', locale)}>{content.nav.download}</a>
          <a href="#overview">{content.nav.overview}</a>
          <a href="#first-run">{content.nav.firstRun}</a>
          <a href="#power-users">{content.nav.powerUsers}</a>
          <a href="#developers">{content.nav.developers}</a>
          <a href="#api">{content.nav.api}</a>
          <a href="#bodhi-server">{content.nav.bodhiServer}</a>
          <a href="#cicd">{content.nav.cicd}</a>
          <a href="#multi-agent">{content.nav.multiAgent}</a>
          <a href="#security">{content.nav.security}</a>
        </nav>

        <LanguageSwitch locale={locale} onChange={setLocale} label={content.nav.language} />
      </header>

      <main className="docs-main">
        <section className="panel docs-hero">
          <p className="section-kicker">{content.docs.kicker}</p>
          <h1>{content.docs.title}</h1>
          <p className="docs-description">{content.docs.description}</p>
          <small>
            {content.docs.updatedLabel}: {updatedAt}
          </small>
        </section>

        <div className="docs-layout">
          <aside className="panel docs-toc" aria-label={content.docs.tocTitle}>
            <h2>{content.docs.tocTitle}</h2>
            <ul>
              {content.docs.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </aside>

          <article className="panel docs-content">
            {content.docs.sections.map((section) => (
              <section className="doc-section" id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.id}-p-${paragraphIndex}`}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={`${section.id}-b-${bulletIndex}`}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
                {section.code ? (
                  <pre>
                    <code>{section.code}</code>
                  </pre>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </main>

      <footer className="footer-line">
        <p>{content.footer.docs}</p>
      </footer>
    </div>
  )
}

function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const isDocsRoute = currentPath === '/docs' || currentPath.startsWith('/docs/')
  const isDownloadRoute = currentPath === '/download' || currentPath.startsWith('/download/')
  const isFeaturesRoute = currentPath === '/features' || currentPath.startsWith('/features/')
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const content = useMemo(() => translations[locale], [locale])

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'

    const url = new URL(window.location.href)
    url.searchParams.set('lang', locale)
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [locale])

  useEffect(() => {
    document.title = isDocsRoute
      ? content.meta.docsTitle
      : isDownloadRoute
        ? locale === 'zh'
          ? '下载 Bodhi · 最新版本与真实产品界面'
          : 'Download Bodhi · Latest release and real product surfaces'
        : isFeaturesRoute
          ? content.meta.featuresTitle
          : content.meta.homeTitle
  }, [content, isDocsRoute, isDownloadRoute, isFeaturesRoute, locale])

  return isDocsRoute ? (
    <DocsPage locale={locale} setLocale={setLocale} content={content} />
  ) : isDownloadRoute ? (
    <DownloadPage locale={locale} setLocale={setLocale} content={content} />
  ) : isFeaturesRoute ? (
    <FeaturesPage locale={locale} setLocale={setLocale} content={content} />
  ) : (
    <HomePage locale={locale} setLocale={setLocale} content={content} />
  )
}

export default App
