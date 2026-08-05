import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import HtmlRspackPlugin from 'html-rspack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { resolve } from 'path';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import pkg from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'];

const isDev = process.env.NODE_ENV === 'development';
const PORT = 8081;
const PUBLIC_PATH = `${process.env.PUBLIC_PATH_URL}/`;
const FEDERATION_NAME = 'agent_builder';

const connectUrl = process.env.MODULE_FEDERATION_CONNECT_URL;

const scssAdditionalData = `@use '@weni/unnnic-system/src/assets/scss/unnnic.scss' as *;`;

/**
 * Dev: vue-style-loader chain so Vue SFC blocks hot-reload.
 * Prod: native CSS (experiments.css) for hashed standalone CSS files.
 */
function styleRule(test, loadersAfterCss = []) {
  if (isDev) {
    return {
      test,
      use: ['vue-style-loader', 'css-loader', ...loadersAfterCss],
      type: 'javascript/auto',
    };
  }

  return {
    test,
    use: [...loadersAfterCss],
    type: 'css',
  };
}

export default defineConfig({
  ...(isDev ? { devtool: 'eval-cheap-module-source-map' } : {}),
  context: __dirname,
  devServer: {
    port: PORT,
    historyApiFallback: true,
    hot: true,
    liveReload: false,
    compress: true,
    headers: {
      // Module Federation cross-origin: the connect host fetches
      // `remoteEntry.js` from this dev server during local federation testing.
      'Access-Control-Allow-Origin': '*',
    },
    client: {
      // Federated: the host page may run on another origin/port, so the HMR
      // client must connect back to this remote's own websocket explicitly.
      webSocketURL: `ws://localhost:${PORT}/ws`,
    },
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    uniqueName: FEDERATION_NAME,
    publicPath: PUBLIC_PATH,
    filename: isDev
      ? 'assets/js/[name].js'
      : 'assets/js/[name]-[contenthash].js',
    chunkFilename: isDev
      ? 'assets/js/[name].js'
      : 'assets/js/[name]-[contenthash].js',
    assetModuleFilename: 'assets/[name]-[hash][ext]',
  },
  entry: {
    main: './src/bootstrap.js',
  },
  stats: {
    warnings: false,
  },
  resolve: {
    extensions: ['...', '.ts', '.vue'],
    alias: {
      '@': resolve(__dirname, 'src'),
      ...(connectUrl
        ? {}
        : {
            'connect/sharedStore': resolve(
              __dirname,
              'src/stubs/connectSharedStore.js',
            ),
          }),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
      // Dev: inject registerStoreHMR for every defineStore export (no per-file boilerplate).
      ...(isDev
        ? [
            {
              test: /\.(js|ts)$/,
              include: [path.resolve(__dirname, 'src/store')],
              exclude: [/node_modules/, /\.spec\./, /\.unit\./, /__tests__/],
              enforce: 'pre',
              use: [path.resolve(__dirname, 'build/pinia-hmr-loader.js')],
            },
          ]
        : []),
      styleRule(/\.(scss|sass)$/, [
        {
          loader: 'sass-loader',
          options: {
            additionalData: scssAdditionalData,
          },
        },
      ]),
      styleRule(/\.css$/),
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name]-[hash][ext]',
        },
      },
      {
        test: /\.(wav|mp3|ogg|aac|flac|m4a)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/audio/[name]-[hash][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: './index.html',
      inject: 'head',
      chunks: ['main'],
      minify: {
        removeComments: false,
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeAttributeQuotes: false,
      },
    }),
    new rspack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      'process.env': JSON.stringify(process.env),
      'import.meta.env': JSON.stringify({
        BASE_URL: '/',
      }),
    }),
    new VueLoaderPlugin(),
    new rspack.container.ModuleFederationPlugin({
      name: FEDERATION_NAME,
      filename: 'remoteEntry.js',
      exposes: {
        './main': './src/main.js',
        './WorkspaceCredentials': './src/exports/WorkspaceCredentials.vue',
        './WorkspaceChangesHistory':
          './src/exports/WorkspaceChangesHistory.vue',
        './WorkspaceProjectDetails':
          './src/exports/WorkspaceProjectDetails.vue',
      },
      remotes: {
        ...(connectUrl
          ? {
              connect: `connect@${connectUrl}/remoteEntry.js`,
            }
          : {}),
      },
      shared: {
        vue: {
          singleton: true,
          requiredVersion: '^3.0.0',
          eager: true,
        },
        pinia: {
          singleton: true,
          requiredVersion: pkg.dependencies.pinia,
        },
        'vue-router': {
          singleton: true,
          requiredVersion: pkg.dependencies['vue-router'],
        },
        'vue-i18n': {
          singleton: true,
          requiredVersion: pkg.dependencies['vue-i18n'],
          eager: true,
        },
      },
    }),
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    // Native CSS is incompatible with vue-style-loader HMR; enable only in prod.
    css: !isDev,
  },
});
