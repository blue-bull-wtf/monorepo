import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path';
import * as dotenv from 'dotenv';

import { existsSync, readFileSync } from 'fs';

const envPath = '.env';

// https://vitejs.dev/config/
export default ({ mode }: any) => {
  // wrap OS + .env variables into process.env
  process.env = loadEnv(mode, process.cwd(), ''); // <-- #sec-sensitive do not expose to compiled app
  const appEnv = existsSync(envPath) ? dotenv.parse(readFileSync(envPath, { encoding: 'utf8' })) : {}; // <-- .env only
  appEnv.npm_package_version = process.env.npm_package_version as string;
  appEnv.npm_package_description = process.env.npm_package_description as string;
  appEnv.NODE_ENV = (process.env.NODE_ENV as string) ?? 'production';

  return defineConfig({
    // base: './',
    // Node.js global to browser globalThis
    define: {
      global: 'globalThis',
      __version__: JSON.stringify(process.env.npm_package_version),
      'process.env': appEnv,
    },
    plugins: [vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('dotlottie-player'),
        },
      },
    })],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@common': path.resolve(__dirname, '../common'),
      },
    },
    server: {
      port: 3000,
      fs: {
        allow: [
          // searchForWorkspaceRoot(process.cwd()),
          path.resolve(__dirname, './'),
          path.resolve(__dirname, '../common'),
        ]
      }
    }
  });
};
