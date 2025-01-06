import { merge } from 'webpack-merge';
import commonConfig from './webpack.config.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default merge(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.s?[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.[jt]sx?$/i,
        exclude: /(node_modules)/,
        use: 'swc-loader',
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: '[name].css' })],
  resolve: {
    alias: {
      // Replace the standard React DOM with the profiling build
      'react-dom$': 'react-dom/profiling',
      // Replace the standard Scheduler with the profiling version
      'scheduler/tracing': 'scheduler/tracing-profiling',
    },
  },
});
