import { resolve } from 'node:path';
import { defineWeniConfig } from '@weni/rspack-config';
import pkg from './package.json' with { type: 'json' };
const connectUrl = process.env.MODULE_FEDERATION_CONNECT_URL;

export default defineWeniConfig({
  dirname: import.meta.dirname,
  pkg,
  port: 8081,
  entry: './src/bootstrap.js',
  federation: {
    name: 'agent_builder',
    exposes: {
      './main': './src/main.js',
      './WorkspaceCredentials': './src/exports/WorkspaceCredentials.vue',
      './WorkspaceChangesHistory': './src/exports/WorkspaceChangesHistory.vue',
      './WorkspaceProjectDetails': './src/exports/WorkspaceProjectDetails.vue',
    },
    remotes: {
      connect: connectUrl,
    },
  },
  aliases: connectUrl
    ? {}
    : {
        'connect/sharedStore': resolve(
          import.meta.dirname,
          'src/stubs/connectSharedStore.js',
        ),
      },
});
