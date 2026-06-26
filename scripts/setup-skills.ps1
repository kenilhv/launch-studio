# Installs the Launch Studio Claude Code skill toolkit into ~/.claude/skills
# Usage (Windows PowerShell):  ./scripts/setup-skills.ps1
# Mirrors exactly what's on Kenil's machine. Safe to re-run.

$ErrorActionPreference = "Stop"
$dst = Join-Path $env:USERPROFILE ".claude\skills"
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$tmp = Join-Path $env:TEMP "ls-skills-$(Get-Random)"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

# repo  -> @{ url; subdir (where SKILL.md folders live); names (which to copy, @() = all) }
$repos = @(
  @{ name="uiux";        url="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git"; sub=".claude/skills"; names=@("ui-ux-pro-max","design","design-system","brand","banner-design","ui-styling","slides") },
  @{ name="laguagu";     url="https://github.com/laguagu/claude-code-nextjs-skills.git";    sub="skills";        names=@("ai-app","ai-elements","ai-sdk-6","cache-components","next-best-practices","nextjs-chatbot","nextjs-seo","nextjs-shadcn","openai-agents-sdk","react-best-practices","shadcn","web-design-guidelines") },
  @{ name="anthropic";   url="https://github.com/anthropics/skills.git";                    sub="skills";        names=@("frontend-design") },
  @{ name="freshtech";   url="https://github.com/freshtechbro/claudedesignskills.git";      sub=".claude/skills"; names=@("motion-framer","gsap-scrolltrigger") },
  @{ name="superpowers"; url="https://github.com/obra/superpowers.git";                     sub="skills";        names=@("brainstorming","dispatching-parallel-agents","executing-plans","finishing-a-development-branch","receiving-code-review","requesting-code-review","subagent-driven-development","systematic-debugging","test-driven-development","using-git-worktrees","using-superpowers","verification-before-completion","writing-plans","writing-skills") }
)

$count = 0
foreach ($r in $repos) {
  $clone = Join-Path $tmp $r.name
  Write-Host "Cloning $($r.url) ..." -ForegroundColor Cyan
  git clone --depth 1 --quiet $r.url $clone
  $srcRoot = Join-Path $clone ($r.sub -replace "/", "\")
  foreach ($n in $r.names) {
    $src = Join-Path $srcRoot $n
    if (Test-Path $src) { Copy-Item $src -Destination $dst -Recurse -Force; $count++ }
    else { Write-Host "  missing: $n" -ForegroundColor Yellow }
  }
}

Remove-Item -Recurse -Force $tmp
Write-Host "`nInstalled $count skills into $dst" -ForegroundColor Green
Write-Host "Restart Claude Code so it picks them up." -ForegroundColor Green
