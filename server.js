// server.js
import { config } from '@dotenvx/dotenvx';
import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import fs from 'fs';
import https from 'https';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  createProxyMiddleware({
    // Points to your AUTH service (https in production):
    pathFilter: (path) => path.includes('/oauth2/'),
    target: process.env.AUTH_URL,
    secure: false,
    changeOrigin: true,
    autoRewrite: false,
    toProxy: true,
    headers: {
      'X-Forwarded-Host': 'localhost:8080',
    },
    onProxyRes: (proxyRes) => {
      console.log('##########', proxyRes);
      const location = proxyRes.headers.location;
      if (location) {
        proxyRes.headers.location = location.replace(
          'konflux-ui.apps.stone-stg-rh01.l2vh.p1.openshiftapps.com%2Foauth2',
          'localhost:8080/oauth2',
        );
      }
    },
  }),
);

app.use(
  createProxyMiddleware({
    pathFilter: (path) => path.includes('/api/k8s/registration'),
    target: process.env.REGISTRATION_URL,
    secure: false,
    changeOrigin: true,
    autoRewrite: true,
    ws: true,
    toProxy: true,
  }),
);

app.use(
  createProxyMiddleware({
    pathFilter: (path) => path.includes('/api/k8s'),
    target: process.env.PROXY_URL,
    secure: false,
    changeOrigin: true,
    autoRewrite: true,
    ws: true,
    toProxy: true,
    // pathRewrite: { '^/api/k8s': '' },
  }),
);

app.use(
  createProxyMiddleware({
    pathFilter: (path) => path.includes('/wss/k8s'),
    target: process.env.PROXY_WEBSOCKET_URL,
    secure: false,
    changeOrigin: true,
    autoRewrite: true,
    ws: true,
    toProxy: true,
    // pathRewrite: { '^/wss/k8s': '' },
  }),
),
  app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
const httpsOptions = {
  key: fs.readFileSync('../server.key'),
  cert: fs.readFileSync('../server.crt'),
};

// Start HTTPS server
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});
