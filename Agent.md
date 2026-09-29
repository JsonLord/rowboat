# Rowboat Hugging Face Space Deployment Guide

You are a deployment manager for this codebase with the aim of making `rowboat-server` run on Hugging Face Spaces as outlined in this `Agent.md` file.

Start an iterative loop of modifying the codebase, running the deployment script, getting the logs, and monitoring them until successful deployment. If any logs indicate failure, fix these issues in the codebase via code modifications, redeploy, and monitor the logs.

## 1. Deployment Configuration

### Target Space
- **Profile:** `Leon4gr45`
- **Space:** `rowboat`
- **Full Identifier:** `Leon4gr45/rowboat`
- **Frontend Port:** `7860` (mandatory for all Hugging Face Spaces)

### Deployment Method
- **Docker SDK** — builds and runs `rowboat-server` (headless edition from `apps/x/apps/server`).

### HF Token
- The environment variable **`HF_TOKEN` will always be provided at execution time**.
- Never hardcode the token. Always read it from the environment.
- All monitoring and log‑streaming commands rely on `$HF_TOKEN`.

### Required Files
- `Dockerfile`
- `README.md` with Hugging Face YAML frontmatter:
  ```yaml
  ---
  title: Rowboat
  sdk: docker
  app_port: 7860
  ---
  ```
- `.hfignore` to exclude unnecessary files
- This `Agent.md` file (must be committed before deployment)

---

## 2. API Exposure and Documentation

### Mandatory Endpoints
Every deployment **must** expose:

- **`/health`**
  - Returns HTTP 200 when the app is ready.
  - Required for Hugging Face to transition the Space from *starting* → *running*.

- **`/api-docs`**
  - Documents **all** available API endpoints and MCP capabilities.
  - Reachable at `https://Leon4gr45-rowboat.hf.space/api-docs`

### Functional Endpoints

### `/health`
- Method: GET
- Purpose: Health check endpoint for Hugging Face Spaces monitoring
- Request: `GET /health`
- Response:
```json
{
  "ok": true,
  "status": "ok",
  "name": "rowboat-server",
  "service": "rowboat-server",
  "apiVersion": 0,
  "serverVersion": "0.1.0"
}
```

### `/api-docs`
- Method: GET
- Purpose: Returns API documentation for all endpoints
- Request: `GET /api-docs`
- Response:
```json
{
  "title": "Rowboat Server API",
  "description": "Open-source personal AI assistant server API and MCP endpoints",
  "version": "0.1.0",
  "endpoints": [...]
}
```

### `/mcp`
- Method: POST / GET
- Purpose: Model Context Protocol (MCP) server over HTTP (Streamable HTTP transport)
- Request: MCP JSON-RPC over HTTP
- Connect with any MCP client via Streamable HTTP at `https://Leon4gr45-rowboat.hf.space/mcp`
- Available MCP tools include:
  - `rowboat_list_projects`
  - `rowboat_create_session`
  - `rowboat_send_message`
  - `rowboat_get_session`
  - `rowboat_list_sessions`
  - `rowboat_read_file`
  - `rowboat_write_file`
  - `rowboat_list_files`
  - `rowboat_search`
  - `rowboat_list_mcp_tools`
  - `rowboat_execute_mcp_tool`

### `/rpc/:channel`
- Method: POST
- Purpose: RPC endpoint for Rowboat channels (e.g., `sessions:sendMessage`, `workspace:readFile`)
- Request: `POST /rpc/sessions:list` (Header: `Authorization: Bearer <token>`)

### `/workspace/*`
- Method: GET / PUT / DELETE
- Purpose: Workspace file operations (reading, writing, deleting files)

---

## 3. Deployment Workflow

Precondition: Use the Hugging Face Hub CLI (`hf`) to check that the space is ready for uploading.

### Standard Deployment Command
After any code change, run:

```bash
hf upload Leon4gr45/rowboat --repo-type=space
```

### Scan build and run logs
Get build logs (SSE):
```bash
curl -N -H "Authorization: Bearer $HF_TOKEN" "https://huggingface.co/api/spaces/Leon4gr45/rowboat/logs/build"
```

Get run logs (SSE) once the build logs succeed:
```bash
curl -N -H "Authorization: Bearer $HF_TOKEN" "https://huggingface.co/api/spaces/Leon4gr45/rowboat/logs/run"
```

After 300 seconds to see if the deployment has been successful, and if not, fix the errors of deployment, and redeploy and monitor in a cycle until the space is running and reacts to the API endpoints.
