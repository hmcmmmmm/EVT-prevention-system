# ---- 构建前端 ----
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- 构建后端 ----
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# ---- 生产环境镜像 ----
FROM node:18-alpine
WORKDIR /app

# 安装 Nginx 用于静态文件托管代理
RUN apk add --no-cache nginx

# 复制后端产物和依赖
WORKDIR /app/server
COPY --from=server-build /app/server/package*.json ./
COPY --from=server-build /app/server/dist ./dist
RUN npm install --production

# 复制前端产物到 Nginx 目录
COPY --from=client-build /app/client/build /usr/share/nginx/html

# 配置 Nginx 代理前端请求并转发 /api 到后端 Node.js
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://127.0.0.1:3001; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/http.d/default.conf

# 启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'cd /app/server && node dist/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 80
CMD ["/app/start.sh"]
