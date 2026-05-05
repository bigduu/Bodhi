# Pavilion

Pavilion is the official website and public documentation surface for the Zenith AI stack.

It is the place where the external story gets unified:
- **Bodhi AI** as the desktop AI product
- **Bamboo** as the structured Rust runtime
- **Lotus** as the visible interaction layer
- **Bodhi Server** as the Go backend service

## What Pavilion is for

Pavilion is not the runtime and not the desktop shell itself.
Its job is to:

- explain the product clearly to new users
- keep marketing language and docs entry points consistent
- route users toward download, first run, advanced automation, and developer paths
- make the Bodhi AI / Lotus / Bamboo / Bodhi Server relationship easy to understand

## Core paths

- **Home page**: product positioning and conversion
- **Download page**: stable desktop install entry
- **Docs page**: first run, automation, architecture, CI/CD, multi-agent collaboration, and developer paths
- **Features page**: detailed breakdown of every capability
- **Article layer**: longer-form founder / product narrative, technical deep-dives

## Articles

| Article | Description |
|---------|-------------|
| [Why I Built My Own Agent](./articles/why-i-built-my-own-agent.md) | Founder's narrative on building Bodhi |
| [Zenith Architecture Overview](./articles/zenith-architecture-overview.md) | Complete technical architecture of the stack |
| [Bodhi Server Deep Dive](./articles/bodhi-server-deep-dive.md) | Backend service technical details |
| [CI/CD & Release System](./articles/ci-cd-and-release-system.md) | Automated release pipeline documentation |
| [Multi-Agent Collaboration](./articles/multi-agent-collaboration.md) | Team coordination guidelines |

## Local development

```bash
cd pavilion
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Messaging boundary

Pavilion should stay aligned with the current external narrative:

- Bodhi AI = the AI that actually works
- Bamboo = structured local-first Rust runtime
- Lotus = visible UI layer
- Bodhi Server = Go backend for authentication and persistence
- the stack is differentiated by execution visibility, structured runtime design, and automation that compounds over time

## Related repositories

- Bodhi: https://github.com/bigduu/Bodhi
- Lotus: https://github.com/bigduu/Lotus
- Bamboo: https://github.com/bigduu/Bamboo-agent

---

## Documentation Sections

### For Users
- First run guide
- Power-user path (Provider, MCP, Workflow, Schedule)
- FAQ

### For Developers
- Architecture and boundaries
- Key APIs
- Bodhi Server integration
- Developer entry points per module

### For Contributors
- CI/CD and release system
- Multi-agent collaboration guidelines
- Security and testing requirements
- Release playbook
