# Testing

- Test with `node bin/claude-itsdone.js test` to verify sound playback
- When adding new features, test on the current platform at minimum
- The `notify` command must exit quickly and silently — it runs inside a Claude Code hook
- Never add test frameworks as dependencies — keep zero-dependency guarantee
