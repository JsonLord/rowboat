export function renderDashboardHtml(serverVersion: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rowboat Server - AI Assistant & MCP Server</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --accent: #10b981;
      --accent-hover: #059669;
      --text: #f9fafb;
      --muted: #9ca3af;
      --code-bg: #030712;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo h1 { font-size: 1.5rem; font-weight: 700; color: #fff; }
    .badge {
      background: rgba(16, 185, 129, 0.15);
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent);
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card h2 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      color: #fff;
    }
    p { color: var(--muted); margin-bottom: 1rem; }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.9rem;
      color: #e5e7eb;
      margin-bottom: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .endpoint-item {
      background: var(--code-bg);
      border: 1px solid var(--border);
      padding: 1rem;
      border-radius: 8px;
    }
    .method {
      display: inline-block;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin-right: 0.5rem;
    }
    .method.get { background: #1e3a8a; color: #60a5fa; }
    .method.post { background: #064e3b; color: #34d399; }
    .path { font-family: monospace; font-weight: 600; color: #fff; }
    .btn {
      display: inline-block;
      background: var(--accent);
      color: #000;
      font-weight: 600;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn:hover { background: var(--accent-hover); }
    footer {
      text-align: center;
      color: var(--muted);
      font-size: 0.85rem;
      margin-top: 3rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <h1>🚣 Rowboat Server</h1>
      </div>
      <div class="badge">
        <span class="badge-dot"></span> Online (v${serverVersion})
      </div>
    </header>

    <div class="card">
      <h2>🤖 Use as MCP Server via HTTP</h2>
      <p>Rowboat Server runs as a Model Context Protocol (MCP) server over HTTP. Connect your AI clients (Claude Code, Cursor, Windsurf, etc.) directly to this endpoint:</p>
      <pre>claude mcp add --transport http rowboat https://leon4gr45-rowboat.hf.space/mcp</pre>
      <p>Available MCP tools include: <code>rowboat_list_projects</code>, <code>rowboat_create_session</code>, <code>rowboat_send_message</code>, <code>rowboat_get_session</code>, <code>rowboat_read_file</code>, <code>rowboat_write_file</code>, <code>rowboat_search</code>, and more.</p>
    </div>

    <div class="card">
      <h2>🔌 Exposed API Endpoints</h2>
      <div class="grid">
        <div class="endpoint-item">
          <div><span class="method get">GET</span> <span class="path">/health</span></div>
          <p style="margin-top:0.5rem; margin-bottom:0;">Health check and readiness status probe.</p>
        </div>
        <div class="endpoint-item">
          <div><span class="method get">GET</span> <span class="path">/api-docs</span></div>
          <p style="margin-top:0.5rem; margin-bottom:0;">JSON API documentation for all endpoints.</p>
        </div>
        <div class="endpoint-item">
          <div><span class="method post">POST</span> <span class="path">/mcp</span></div>
          <p style="margin-top:0.5rem; margin-bottom:0;">Streamable HTTP MCP JSON-RPC protocol endpoint.</p>
        </div>
        <div class="endpoint-item">
          <div><span class="method post">POST</span> <span class="path">/rpc/:channel</span></div>
          <p style="margin-top:0.5rem; margin-bottom:0;">Rowboat IPC RPC channels execution.</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>💻 Rowboat Desktop App Pairing</h2>
      <p>This server can also act as the remote backend for the Rowboat desktop app.</p>
      <a href="https://www.rowboatlabs.com/" target="_blank" rel="noopener" class="btn">Learn More & Download Desktop App</a>
    </div>

    <footer>
      Rowboat Labs &copy; Open-source Personal AI Assistant
    </footer>
  </div>
</body>
</html>`;
}
