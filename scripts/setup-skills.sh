#!/usr/bin/env bash
# Installs the Launch Studio Claude Code skill toolkit into ~/.claude/skills
# Usage (macOS/Linux):  bash scripts/setup-skills.sh
set -euo pipefail

DST="$HOME/.claude/skills"
mkdir -p "$DST"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

clone_copy() {
  local url="$1" sub="$2"; shift 2
  local dir="$TMP/$(basename "$url" .git)"
  echo "Cloning $url ..."
  git clone --depth 1 --quiet "$url" "$dir"
  for n in "$@"; do
    if [ -d "$dir/$sub/$n" ]; then cp -R "$dir/$sub/$n" "$DST/"; else echo "  missing: $n"; fi
  done
}

clone_copy https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git .claude/skills \
  ui-ux-pro-max design design-system brand banner-design ui-styling slides
clone_copy https://github.com/laguagu/claude-code-nextjs-skills.git skills \
  ai-app ai-elements ai-sdk-6 cache-components next-best-practices nextjs-chatbot \
  nextjs-seo nextjs-shadcn openai-agents-sdk react-best-practices shadcn web-design-guidelines
clone_copy https://github.com/anthropics/skills.git skills frontend-design
clone_copy https://github.com/freshtechbro/claudedesignskills.git .claude/skills \
  motion-framer gsap-scrolltrigger
clone_copy https://github.com/obra/superpowers.git skills \
  brainstorming dispatching-parallel-agents executing-plans finishing-a-development-branch \
  receiving-code-review requesting-code-review subagent-driven-development systematic-debugging \
  test-driven-development using-git-worktrees using-superpowers verification-before-completion \
  writing-plans writing-skills

echo "Done. Restart Claude Code so it picks up the new skills."
