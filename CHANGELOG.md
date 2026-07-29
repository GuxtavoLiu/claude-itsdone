# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-07-29

### Added

- `install --on-stop` flag: also play the sound on the `Stop` event (when Claude finishes responding)
- `status` now shows which hook events are installed
- Automatic backup of `~/.claude/settings.json` to `settings.json.bak` before any change
- Warning when setting a custom sound file that is not `.wav`
- `playDetached` in the public API
- CI workflow (syntax check + CLI smoke test on Linux, Windows and macOS)

### Changed

- The installed hook command uses absolute paths to Node.js and the script, so it no longer depends on `claude-itsdone` being on the hook environment's PATH
- Sound playback uses `spawn` with argument arrays instead of shell strings
- `uninstall` exits with code 1 on failure (was always 0)

### Fixed

- `notify` plays synchronously again. An unreleased change on `main` made it play in a detached process, but Claude Code kills the hook's process tree as soon as the hook command exits, so the detached player was terminated before making any sound and notifications went silent for anyone running from `main`
- `install`/`uninstall` no longer overwrite `~/.claude/settings.json` when it exists but contains invalid JSON; they abort with an error instead
- Custom sound files in paths containing parentheses (e.g. `C:\Program Files (x86)\...`) are no longer rejected on Windows

## [1.1.0] - 2026-03-24

### Added

- Five new presets: `coin`, `levelup`, `doorbell`, `alert`, `whistle`
- `--version` / `-v` flag
- FAQ section in the README

### Changed

- Hardened melody command and deduplicated `sanitizePath`

## [1.0.0] - 2026-03-23

### Added

- CLI with `install`, `uninstall`, `test`, `notify`, `status`, `preset`, `sound`, and `reset` commands
- Cross-platform sound playback (Windows, macOS, Linux)
- Five built-in presets: `default`, `gentle`, `urgent`, `chime`, `pulse`
- Custom `.wav` file support
- Automatic Claude Code hook installation via `claude-itsdone install`
- User configuration stored at `~/.claude-itsdone/config.json`

[1.2.0]: https://github.com/GuxtavoLiu/claude-itsdone/releases/tag/v1.2.0
[1.1.0]: https://github.com/GuxtavoLiu/claude-itsdone/releases/tag/v1.1.0
[1.0.0]: https://github.com/GuxtavoLiu/claude-itsdone/releases/tag/v1.0.0
