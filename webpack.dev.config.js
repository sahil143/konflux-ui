import { merge } from 'webpack-merge';
import commonConfig from './webpack.config.js';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export default merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    proxy: [
      {
        context: (path) => path.includes('/oauth2/') || path.includes('/idp/'),
        // [TODO]: change API URL
        target: 'https://127.0.0.1:9443/',
        secure: false,
        changeOrigin: true,
        autoRewrite: true,
      },
      {
        context: (path) => path.includes('/api/k8s/registration'),
        // [TODO]: change API URL
        target: 'REGISTRATION_URL',
        secure: false,
        changeOrigin: true,
        autoRewrite: true,
        ws: true,
        pathRewrite: { '^/api/k8s/registration': '' },
      },
      {
        context: (path) => path.includes('/api/k8s'),
        // [TODO]: change API URL
        target: 'PROXY_URL',
        secure: false,
        changeOrigin: true,
        autoRewrite: true,
        ws: true,
        pathRewrite: { '^/api/k8s': '' },
      },
      {
        context: (path) => path.includes('/wss/k8s'),
        // [TODO]: change API URL
        target: 'PROXY_WEBSOCKET_URL',
        secure: false,
        changeOrigin: true,
        autoRewrite: true,
        ws: true,
        pathRewrite: { '^/wss/k8s': '' },
      },
    ],
  },
  module: {
    rules: [
      {
        test: /\.s?[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.[jt]sx?$/i,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'swc-loader',
            options: {
              jsc: {
                transform: {
                  react: {
                    development: true,
                    refresh: true,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [new ReactRefreshWebpackPlugin(), new ForkTsCheckerWebpackPlugin()],
});
