# Rowboat Hugging Face Space Deployment Guide

You are a deployment manager for this codebase with the aim of making it run on the huggingface space as outlined in this Agent.md file which you add to the codebase after deployment to inform further agents about tricks and ongoing deployment best practices.

start an iterative loop of modifying the codebase, running the deployment script, getting the logs and monitoring them until successful deployment. If nay logs indicate failure, fix these issues in the codebase via code modifications, and redeploy and again monitor the logs.

## 1. Deployment Configuration

### Target Space
- **Profile:** `Leon4gr45`
- **Space:** `rowboat`
- **Full Identifier:** `Leon4gr45/rowboat`
- **Frontend Port:** `7860` (mandatory for all Hugging Face Spaces)

### Deployment Method
Choose the correct SDK based on the app type based on the codebase language:

- **Gradio SDK** — for Gradio applications
- **Streamlit SDK** — for Streamlit applications
- **Docker SDK** — for all other applications (recommended default for flexibility)

### HF Token
- The environment variable **`HF_TOKEN` will always be provided at execution time**.
- Never hardcode the token. Always read it from the environment.
- All monitoring and log‑streaming commands rely on `$HF_TOKEN`.

### Required Files
- `Dockerfile` (or `app.py` for Gradio/Streamlit SDKs)
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
  - Documents **all** available API endpoints.
  - Must be reachable at:
    `https://Leon4gr45-rowboat.hf.space/api-docs`

### Functional Endpoints

### /health
- Method: GET
- Purpose: Health check endpoint for Hugging Face Spaces monitoring
- Request: `GET /health`
- Response:
```json
{
  "status": "ok",
  "service": "Rowboat Labs (dev)"
}
```

### /api-docs
- Method: GET
- Purpose: Returns API documentation for all endpoints
- Request: `GET /api-docs`
- Response:
```json
{
  "title": "Rowboat Harbor API",
  "description": "Open-source personal AI assistant server API documentation",
  "endpoints": [...]
}
```

### /v1/health
- Method: GET
- Purpose: Returns server status and organization info
- Request: `GET /v1/health`
- Response:
```json
{
  "ok": true,
  "org": {
    "name": "Rowboat Labs",
    "address": "localhost:7860"
  }
}
```

### /v1/me
- Method: GET
- Purpose: Get current authenticated member details
- Request: `GET /v1/me` (Header: `Authorization: Bearer <token>`)
- Response:
```json
{
  "member": {
    "id": "ramnique",
    "displayName": "Ramnique",
    "role": "admin"
  }
}
```

### /v1/spaces
- Method: GET
- Purpose: List accessible spaces
- Request: `GET /v1/spaces?includeDirect=true`
- Response:
```json
{
  "spaces": [
    {
      "id": "sp_1",
      "name": "Roadboard"
    }
  ]
}
```

### /v1/spaces
- Method: POST
- Purpose: Create a new space
- Request:
```json
{
  "name": "New Space"
}
```
- Response:
```json
{
  "space": {
    "id": "sp_2",
    "name": "New Space"
  }
}
```

### /v1/spaces/:spaceId/assets
- Method: GET
- Purpose: List assets in a space
- Request: `GET /v1/spaces/:spaceId/assets`
- Response:
```json
{
  "entries": [
    {
      "path": "README.md",
      "id": "ast_1"
    }
  ]
}
```

### /v1/spaces/:spaceId/messages
- Method: POST
- Purpose: Post a message or topic in a space
- Request:
```json
{
  "body": "Hello team!"
}
```
- Response:
```json
{
  "message": {
    "id": "msg_1",
    "body": "Hello team!"
  }
}
```

---

## 3. Deployment Workflow

Precondition: Use the huggingface hub cli hf to check that the space is empty of files nd delete any which are still in there and not belonging to the project to be uploaded

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

After 300 seconds to see if the deployment has been successful, and if not, fix the errors of deployment, and redeploy and monitor in a cycle until the space is running and reacts to the api endpoints you created.
