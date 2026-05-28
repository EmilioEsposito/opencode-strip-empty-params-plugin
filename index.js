/**
 * opencode-strip-empty-params-plugin
 *
 * An opencode plugin that strips empty-string values from non-required MCP
 * tool-call arguments before the call reaches the server.
 *
 * Some LLMs (notably OpenAI GPT-family models) always emit every JSON key
 * defined in a tool's input schema, filling optional parameters with empty
 * strings, zeros, or false even when no value was intended.  Several MCP
 * servers — including Slack's — treat "" differently from an absent key,
 * causing silent failures (zero results, validation errors, etc.).
 *
 * This plugin intercepts tool.execute.before and removes any argument
 * whose value is "" and whose key is not listed in the tool schema's
 * required array.  Required parameters are left untouched so genuine
 * errors surface normally.
 *
 * Options (all optional):
 *   scope   – "mcp" (default, MCP tools only) | "all" (every tool)
 *   verbose – true to log each stripped key to stderr
 */

export default async (_input, options) => {
  const scope = options?.scope ?? "mcp";
  const verbose = options?.verbose ?? false;

  return {
    "tool.execute.before": async (input, output) => {
      const toolName = input.tool?.name ?? "unknown";

      // When tool metadata is available, respect the scope filter.
      // When it is not (input.tool is undefined), apply the fix anyway —
      // the whole point is to be defensive against missing metadata.
      const source = input.tool?.source;
      if (scope === "mcp" && source != null && source !== "mcp") return;

      const args = output.args;
      if (args == null || typeof args !== "object" || Array.isArray(args)) return;

      const required = new Set(
        input.tool?.inputSchema?.required ?? [],
      );

      for (const key of Object.keys(args)) {
        if (required.has(key)) continue;
        if (args[key] === "") {
          if (verbose) {
            process.stderr.write(
              `[strip-empty-params] ${toolName}: removing empty "${key}"\n`,
            );
          }
          delete args[key];
        }
      }
    },
  };
};
