# claude-itsdone

Sound notification tool for Claude Code. Plays a sound when Claude Code needs human action.

## Project structure

- `bin/claude-itsdone.js` — CLI entry point (switch/case dispatching commands)
- `src/sound.js` — sound playback logic (presets, beep/melody/custom file commands)
- `src/config.js` — user config persistence (~/.claude-itsdone/config.json)
- `src/installer.js` — installs/uninstalls hook in Claude Code settings (~/.claude/settings.json)
- `src/index.js` — public API re-exports

## Key decisions

- Zero dependencies — only Node.js built-ins (child_process, fs, path, os)
- Sound playback is platform-specific: PowerShell on Windows, afplay on macOS, paplay/aplay on Linux
- Failures are always silent — sound should never break the user's workflow
- Hook type is `Notification` in Claude Code settings

## Commands

```
install / uninstall — manage hook in ~/.claude/settings.json
test / notify — play sound (test = with logs, notify = silent for hook use)
preset <name> — switch preset (default, gentle, urgent, chime, pulse)
sound <path> — set custom .wav file
status — show installation and config info
reset — restore defaults
```

## Running

```bash
node bin/claude-itsdone.js test      # test sound
node bin/claude-itsdone.js install   # install hook
```

## Code style

- CommonJS modules (require/module.exports)
- No external dependencies allowed
- Semicolons, double quotes (editorconfig enforced)
- Silent catch blocks for sound playback — intentional, not accidental
