# opencode-strip-empty-params-plugin

An [opencode](https://opencode.ai) plugin that strips empty-string values from
non-required MCP tool-call arguments before the call reaches the server.

## Problem

Some LLMs (notably OpenAI GPT-family models) always emit every JSON key defined
in a tool's input schema, filling optional parameters with empty strings, zeros,
or `false` even when no value was intended.

Several MCP servers treat `""` differently from an absent key. For example,
Slack's MCP server returns zero results when `cursor: ""` is passed, even though
omitting `cursor` entirely works correctly. This makes the same MCP tool work
with one model family and silently fail with another.

## How it works

The plugin hooks `tool.execute.before` and, for each MCP tool call, removes any
argument whose value is `""` **and** whose key is not in the tool schema's
`required` array.

Required parameters are never touched so genuine validation errors still surface.

## Installation

```jsonc
// opencode.json
{
  "plugin": [
    "opencode-strip-empty-params-plugin"
    // or with options:
    // ["opencode-strip-empty-params-plugin", { "scope": "all", "verbose": true }]
  ]
}
```

## Options

| Option    | Type                | Default | Description                                    |
|-----------|---------------------|---------|------------------------------------------------|
| `scope`   | `"mcp"` \| `"all"` | `"mcp"` | Which tools to apply to                        |
| `verbose` | `boolean`           | `false` | Log each stripped key to stderr for debugging  |

## Publishing

```bash
npm login     # one-time, opens browser to authenticate with npmjs.org
npm publish
```

The package is unscoped so it publishes as public by default. Bump the
`version` in `package.json` before each release.

## License

MIT
