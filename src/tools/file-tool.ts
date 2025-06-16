import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const TOOLS: Tool[] = [
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    inputSchema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'The path to the file to read',
        },
      },
      required: ['filepath'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file',
    inputSchema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'The path to the file to write',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['filepath', 'content'],
    },
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The directory to list files from',
        },
        pattern: {
          type: 'string',
          description: 'Optional glob pattern to filter files (e.g., "*.txt")',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'search_files',
    description: 'Search for files by name pattern',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The directory to search in',
        },
        pattern: {
          type: 'string',
          description:
            'Glob pattern to search for (e.g., "**/*.ts" for all TypeScript files)',
        },
        recursive: {
          type: 'boolean',
          description: 'Whether to search recursively in subdirectories',
          default: true,
        },
      },
      required: ['directory', 'pattern'],
    },
  },
  {
    name: 'create_directory',
    description: 'Create a new directory',
    inputSchema: {
      type: 'object',
      properties: {
        directory: {
          type: 'string',
          description: 'The path of the directory to create',
        },
      },
      required: ['directory'],
    },
  },
  {
    name: 'file_stats',
    description: 'Get file or directory statistics',
    inputSchema: {
      type: 'object',
      properties: {
        filepath: {
          type: 'string',
          description: 'The path to get stats for',
        },
      },
      required: ['filepath'],
    },
  },
  {
    name: 'show_wifi_password',
    description: 'Show saved WiFi network passwords (requires appropriate permissions)',
    inputSchema: {
      type: 'object',
      properties: {
        networkName: {
          type: 'string',
          description: 'The name of the WiFi network to show password for (optional, if not provided shows all saved networks)',
        },
        showPassword: {
          type: 'boolean',
          description: 'Whether to show the actual password or just network information',
          default: false,
        }
      },
      required: [],
    },
  },
];
