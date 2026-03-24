# claude-itsdone

Sound notifications for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — never miss when it needs your attention.

`claude-itsdone` plays a short sound alert whenever Claude Code enters a **waiting-for-human-action** state (e.g., asking you to approve a file edit, confirm a command, or answer a question). No more staring at the terminal waiting.

## Features

- **Zero dependencies** — pure Node.js, nothing to install beyond the package itself
- **Cross-platform** — Windows, macOS, and Linux
- **Multiple presets** — choose from `default`, `gentle`, `urgent`, `chime`, or `pulse`
- **Custom sounds** — use your own `.wav` file
- **One-command setup** — `claude-itsdone install` and you're done
- **Non-intrusive** — if sound playback fails, it never interrupts your workflow

## Installation

```bash
npm install -g claude-itsdone
```

Then hook it into Claude Code:

```bash
claude-itsdone install
```

That's it. Claude Code will now play a sound whenever it needs you.

## Usage

```bash
# Install the hook into Claude Code
claude-itsdone install

# Preview the current notification sound
claude-itsdone test

# Check installation and config status
claude-itsdone status

# Remove the hook from Claude Code
claude-itsdone uninstall
```

## Configuration

### Presets

Switch between built-in sound presets:

```bash
claude-itsdone preset <name>
```

| Preset    | Description                          |
|-----------|--------------------------------------|
| `default` | Single beep (800Hz, 300ms)           |
| `gentle`  | Softer, shorter beep (600Hz, 200ms)  |
| `urgent`  | Rising three-tone melody             |
| `chime`   | Musical C-E-G chord progression      |
| `pulse`   | Two quick pulses                     |

```bash
# Example
claude-itsdone preset chime
claude-itsdone test
```

### Custom sound file

Use any `.wav` file as your notification sound:

```bash
claude-itsdone sound /path/to/your/sound.wav
claude-itsdone test
```

### Reset

Restore default settings:

```bash
claude-itsdone reset
```

## How it works

`claude-itsdone install` adds a [hook](https://docs.anthropic.com/en/docs/claude-code/hooks) to your Claude Code settings (`~/.claude/settings.json`):

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "claude-itsdone notify"
          }
        ]
      }
    ]
  }
}
```

When Claude Code fires a `Notification` event (waiting for human input), it runs `claude-itsdone notify`, which plays the configured sound.

### Sound playback by platform

| Platform | Method                                             |
|----------|----------------------------------------------------|
| Windows  | `[Console]::Beep()` via PowerShell                 |
| macOS    | `afplay` with system sounds                        |
| Linux    | `paplay` / `aplay` with system sounds, or terminal bell |

## Uninstalling

```bash
claude-itsdone uninstall
npm uninstall -g claude-itsdone
```

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

Some ideas for contributions:

- Add new sound presets
- Improve Linux/macOS sound generation (e.g., `sox` tone synthesis)
- Add volume control
- Add a `--quiet-hours` feature
- Package bundled `.wav` files for consistent cross-platform sounds

## FAQ

**Does it work on every project or just the one where I installed it?**
It works globally. The hook is added to `~/.claude/settings.json` (user-level), so every Claude Code session on your machine will play sounds.

**I don't hear any sound. What's wrong?**
Run `claude-itsdone test` to check. On Linux, make sure `paplay` or `aplay` is installed. On macOS, the system sound files must be present at `/System/Library/Sounds/`. On Windows, PowerShell must be available.

**Will it break my workflow if something goes wrong?**
No. Sound playback is wrapped in silent try/catch blocks. If anything fails, it fails quietly — Claude Code keeps working normally.

**Can I use it with other audio formats besides `.wav`?**
It depends on your platform. On macOS, `afplay` supports `.aiff`, `.mp3`, `.wav`, and more. On Linux, `paplay` handles `.ogg`, `.wav`, and others. On Windows, only `.wav` is supported via `SoundPlayer`.

**Do the presets sound different on macOS and Linux?**
On Windows, each preset has distinct frequencies and melodies. On macOS and Linux, presets use system sounds — beep presets play one sound, melody presets play multiple sounds in sequence. The experience varies by platform.

**How do I update to a new version?**
```bash
npm update -g claude-itsdone
```
No need to reinstall the hook — it stays in your settings.

**Does it conflict with other Claude Code hooks?**
No. It only adds its own entry to the `Notification` hook array. Existing hooks are preserved during install and uninstall.

## License

[MIT](LICENSE) — Gustavo Liu
