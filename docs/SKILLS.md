# Claude Code skill toolkit (share with Aarsh)

These are the Claude Code skills installed for building Launch Studio. They live at
user level in `~/.claude/skills/` (not in this repo), so each machine installs them once.

## One-command install
After cloning the repo:
```powershell
# Windows
./scripts/setup-skills.ps1
```
```bash
# macOS / Linux
bash scripts/setup-skills.sh
```
Then **restart Claude Code** so it discovers them. (Also install Python — the
`ui-ux-pro-max` / `design-system` skills run small Python scripts. On Windows use `py`.)

## What gets installed (36 skills)

### 🎨 Design, UI & motion — *most relevant to our build*
| Skill | What it does | Source |
|---|---|---|
| **ui-ux-pro-max** | 50+ styles, 161 palettes, 57 font pairings, UX rules. Our design brain. | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| **frontend-design** | Anthropic's "avoid generic AI-slop" taste skill. | [anthropics/skills](https://github.com/anthropics/skills) |
| **ui-styling** | shadcn/ui + Tailwind component building. | nextlevelbuilder |
| **web-design-guidelines** | Reviews UI code for accessibility/UX compliance. | laguagu |
| **motion-framer** | Framer Motion animation patterns (we use it heavily). | [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) |
| **gsap-scrolltrigger** | GSAP scroll-driven animation. | freshtechbro |
| **design, design-system, brand, banner-design, slides** | Logos, tokens, brand assets, slide decks. | nextlevelbuilder |

### ⚛️ Our stack (Next.js 16 + AI SDK)
| Skill | What it does | Source |
|---|---|---|
| **next-best-practices** | App Router conventions, RSC, hydration. | [laguagu/claude-code-nextjs-skills](https://github.com/laguagu/claude-code-nextjs-skills) |
| **react-best-practices** | Vercel's 70 React perf rules. | laguagu |
| **nextjs-seo** | Metadata, OG images, sitemaps. | laguagu |
| **nextjs-shadcn / shadcn** | Build Next.js UIs with shadcn. | laguagu |
| **cache-components** | Next.js caching / PPR. | laguagu |
| **ai-app / ai-elements / ai-sdk-6 / nextjs-chatbot** | Vercel AI SDK 6 + chat UI. | laguagu |
| **openai-agents-sdk** | Agent / tool-calling patterns. | laguagu |

### 🛠️ Engineering rigor (obra/superpowers)
`brainstorming`, `writing-plans`, `executing-plans`, `systematic-debugging`,
`test-driven-development`, `verification-before-completion`, `requesting-/receiving-code-review`,
`subagent-driven-development`, `dispatching-parallel-agents`, `using-git-worktrees`,
`using-superpowers`, `writing-skills`, `finishing-a-development-branch`
— from [obra/superpowers](https://github.com/obra/superpowers).

> Heads-up: `using-superpowers` triggers aggressively (before any reply). If it gets noisy,
> delete `~/.claude/skills/using-superpowers`.

## Division of labour
- **Kenil** → design/UI skills (`ui-ux-pro-max`, `frontend-design`, `motion-framer`, `ui-styling`).
- **Aarsh** → stack/agent skills (`next-best-practices`, `ai-sdk-6`, `openai-agents-sdk`, `nextjs-seo`).
- Both → superpowers (planning, debugging, code review).
