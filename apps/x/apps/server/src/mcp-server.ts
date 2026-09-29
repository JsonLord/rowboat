import type { IncomingMessage, ServerResponse } from 'node:http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { RpcHandlers } from './channels.js';

const ROWBOAT_MCP_TOOLS = [
  {
    name: 'rowboat_list_projects',
    description: 'List all Rowboat projects',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'rowboat_create_session',
    description: 'Create a new chat session/thread in Rowboat',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectId: { type: 'string', description: 'Optional project ID to attach the session to' },
      },
    },
  },
  {
    name: 'rowboat_send_message',
    description: 'Send a message to a Rowboat session',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sessionId: { type: 'string', description: 'Target session ID' },
        input: { type: 'string', description: 'Message input text' },
      },
      required: ['sessionId', 'input'],
    },
  },
  {
    name: 'rowboat_get_session',
    description: 'Get details and history of a session',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sessionId: { type: 'string', description: 'Target session ID' },
      },
      required: ['sessionId'],
    },
  },
  {
    name: 'rowboat_list_sessions',
    description: 'List active Rowboat sessions',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'rowboat_read_file',
    description: 'Read a file from Rowboat workspace',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path of the file in workspace' },
      },
      required: ['path'],
    },
  },
  {
    name: 'rowboat_write_file',
    description: 'Write or overwrite a file in Rowboat workspace',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative path of the file in workspace' },
        data: { type: 'string', description: 'File content' },
      },
      required: ['path', 'data'],
    },
  },
  {
    name: 'rowboat_list_files',
    description: 'List files in a Rowboat workspace directory',
    inputSchema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Relative directory path in workspace' },
      },
      required: ['path'],
    },
  },
  {
    name: 'rowboat_search',
    description: 'Search across Rowboat sessions and knowledge vault',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Maximum number of results to return' },
      },
      required: ['query'],
    },
  },
  {
    name: 'rowboat_list_mcp_tools',
    description: 'List tools available on an integrated external MCP server',
    inputSchema: {
      type: 'object' as const,
      properties: {
        serverName: { type: 'string', description: 'Name of the connected MCP server' },
      },
      required: ['serverName'],
    },
  },
  {
    name: 'rowboat_execute_mcp_tool',
    description: 'Execute an external MCP tool connected in Rowboat',
    inputSchema: {
      type: 'object' as const,
      properties: {
        serverName: { type: 'string', description: 'Name of the connected MCP server' },
        toolName: { type: 'string', description: 'Tool name' },
        input: { type: 'object', description: 'Input arguments object for the tool' },
      },
      required: ['serverName', 'toolName', 'input'],
    },
  },
];

export async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  handlers: RpcHandlers,
): Promise<void> {
  const server = new Server(
    { name: 'rowboat-server', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: ROWBOAT_MCP_TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
    const name = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    try {
      let result: unknown;
      switch (name) {
        case 'rowboat_list_projects': {
          result = await (handlers['projects:list'] as () => Promise<unknown>)();
          break;
        }
        case 'rowboat_create_session': {
          result = await (handlers['sessions:create'] as (a: unknown) => Promise<unknown>)({
            projectId: typeof args.projectId === 'string' ? args.projectId : undefined,
          });
          break;
        }
        case 'rowboat_send_message': {
          result = await (handlers['sessions:sendMessage'] as (a: unknown) => Promise<unknown>)({
            sessionId: String(args.sessionId),
            input: String(args.input),
          });
          break;
        }
        case 'rowboat_get_session': {
          result = await (handlers['sessions:get'] as (a: unknown) => Promise<unknown>)({
            sessionId: String(args.sessionId),
          });
          break;
        }
        case 'rowboat_list_sessions': {
          result = await (handlers['sessions:list'] as () => Promise<unknown>)();
          break;
        }
        case 'rowboat_read_file': {
          result = await (handlers['workspace:readFile'] as (a: unknown) => Promise<unknown>)({
            path: String(args.path),
            encoding: 'utf8',
          });
          break;
        }
        case 'rowboat_write_file': {
          result = await (handlers['workspace:writeFile'] as (a: unknown) => Promise<unknown>)({
            path: String(args.path),
            data: String(args.data),
          });
          break;
        }
        case 'rowboat_list_files': {
          result = await (handlers['workspace:readdir'] as (a: unknown) => Promise<unknown>)({
            path: String(args.path),
          });
          break;
        }
        case 'rowboat_search': {
          result = await (handlers['search:query'] as (a: unknown) => Promise<unknown>)({
            query: String(args.query),
            limit: typeof args.limit === 'number' ? args.limit : undefined,
          });
          break;
        }
        case 'rowboat_list_mcp_tools': {
          result = await (handlers['mcp:listTools'] as (a: unknown) => Promise<unknown>)({
            serverName: String(args.serverName),
          });
          break;
        }
        case 'rowboat_execute_mcp_tool': {
          result = await (handlers['mcp:executeTool'] as (a: unknown) => Promise<unknown>)({
            serverName: String(args.serverName),
            toolName: String(args.toolName),
            input: (args.input as Record<string, unknown>) ?? {},
          });
          break;
        }
        default:
          return {
            content: [{ type: 'text' as const, text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        structuredContent: typeof result === 'object' && result !== null ? (result as Record<string, unknown>) : undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text' as const, text: `Tool error: ${message}` }],
        isError: true,
      };
    }
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
}
