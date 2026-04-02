# timeslip

CLI for managing time entries (add, update, remove, list) plus listing projects and clients. Inspired by `gh`. Targeting Harvest for v1, but provider-abstracted for future backends.

Deno + Cliffy + TypeScript following patterns from `~/workspace/linear-cli`. No interactive TUI — agent-first with `--json`/`--robot` output modes. Auth and config in XDG dir (TOML), no repo-level config. Credentials are live — never log tokens. Pagination must never silently drop records. All code tested with snapshot tests and mock HTTP servers.
