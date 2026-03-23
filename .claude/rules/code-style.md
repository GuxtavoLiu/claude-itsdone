# Code Style

- CommonJS only (require / module.exports) — no ES modules
- Zero external dependencies — only Node.js built-ins allowed
- Use semicolons and double quotes
- Sound playback must never throw — always wrap in try/catch with empty catch
- Platform-specific code uses `os.platform()` checks (win32, darwin, linux)
- File paths must be resolved with `path.resolve()` before use
