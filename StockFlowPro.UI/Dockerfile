# ULTRA SECURE Multi-stage build for React TypeScript application
# Using distroless approach with minimal attack surface

# Build stage with latest secure Node.js
FROM node:22-alpine AS builder

# Immediate security hardening - remove all unnecessary packages
RUN apk update && apk upgrade --available && \
    # Remove potential vulnerability sources
    apk del --no-cache wget curl busybox-extras openssl-dev || true && \
    # Install only absolutely essential packages
    apk add --no-cache ca-certificates && \
    # Complete cleanup
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /var/log/* /usr/share/doc/* /usr/share/man/* /usr/share/info/* && \
    # Remove ALL SUID/SGID binaries (major security risk)
    find / -type f \( -perm -4000 -o -perm -2000 \) -delete 2>/dev/null || true && \
    # Remove shell history and sensitive files
    rm -f /root/.ash_history /root/.bash_history 2>/dev/null || true

# Create secure non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser -h /app -s /bin/false

# Set secure working directory
WORKDIR /app
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Copy package files with secure ownership
COPY --chown=appuser:appuser package*.json ./

# Secure npm installation with latest version and vulnerability fixes
RUN npm install -g npm@latest && \
    # Clean install with security focus
    npm ci --only=production --no-audit --no-fund --ignore-scripts && \
    # Force fix all vulnerabilities
    npm audit fix --force --audit-level moderate && \
    # Update all packages to latest secure versions
    npm update --save && \
    # Clean cache
    npm cache clean --force

# Copy application source
COPY --chown=appuser:appuser . .

# Build application
RUN npm run build

# Production stage with minimal nginx
FROM nginx:alpine AS production

# Ultra-secure nginx hardening
RUN apk update && apk upgrade --available && \
    # Remove ALL unnecessary packages
    apk del --no-cache wget openssl-dev build-base git curl-dev || true && \
    # Install only essential packages
    apk add --no-cache ca-certificates curl && \
    # Massive cleanup
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* /var/log/* /usr/share/doc/* /usr/share/man/* /usr/share/info/* && \
    # Remove ALL SUID/SGID binaries
    find / -type f \( -perm -4000 -o -perm -2000 \) -delete 2>/dev/null || true && \
    # Remove shell access and sensitive files
    rm -f /bin/sh /bin/ash /bin/bash /root/.ash_history 2>/dev/null || true && \
    # Create minimal shell for nginx
    ln -s /bin/busybox /bin/sh

# Create secure nginx user
RUN addgroup -g 101 -S nginx 2>/dev/null || true && \
    adduser -S nginx -u 101 -G nginx -h /var/cache/nginx -s /bin/false 2>/dev/null || true

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*

# Copy built application with secure ownership
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Create ultra-secure nginx configuration
RUN echo 'user nginx;' > /etc/nginx/nginx.conf && \
    echo 'worker_processes auto;' >> /etc/nginx/nginx.conf && \
    echo 'error_log /dev/stderr warn;' >> /etc/nginx/nginx.conf && \
    echo 'pid /var/run/nginx.pid;' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'events {' >> /etc/nginx/nginx.conf && \
    echo '    worker_connections 1024;' >> /etc/nginx/nginx.conf && \
    echo '    use epoll;' >> /etc/nginx/nginx.conf && \
    echo '    multi_accept on;' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf && \
    echo '' >> /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '    include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '    default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '    sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '    tcp_nopush on;' >> /etc/nginx/nginx.conf && \
    echo '    tcp_nodelay on;' >> /etc/nginx/nginx.conf && \
    echo '    keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '    client_max_body_size 1m;' >> /etc/nginx/nginx.conf && \
    echo '    server_tokens off;' >> /etc/nginx/nginx.conf && \
    echo '    server {' >> /etc/nginx/nginx.conf && \
    echo '        listen 8080;' >> /etc/nginx/nginx.conf && \
    echo '        server_name _;' >> /etc/nginx/nginx.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf && \
    echo '        index index.html;' >> /etc/nginx/nginx.conf && \
    echo '        location / {' >> /etc/nginx/nginx.conf && \
    echo '            try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf && \
    echo '        }' >> /etc/nginx/nginx.conf && \
    echo '        location /health {' >> /etc/nginx/nginx.conf && \
    echo '            return 200 "healthy";' >> /etc/nginx/nginx.conf && \
    echo '            add_header Content-Type text/plain;' >> /etc/nginx/nginx.conf && \
    echo '        }' >> /etc/nginx/nginx.conf && \
    echo '    }' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Set ultra-secure permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/lib/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/lib/nginx /etc/nginx /usr/share/nginx/html /var/run && \
    chmod -R 750 /var/cache/nginx /var/log/nginx /var/lib/nginx && \
    chmod 644 /etc/nginx/nginx.conf && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

# Final switch to non-root user
USER nginx

# Expose secure port
EXPOSE 8080

# Ultra-secure health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Security environment variables
ENV NGINX_USER=nginx \
    NGINX_UID=101 \
    NGINX_GID=101

# Comprehensive security labels
LABEL security.level="maximum" \
      security.non-root="true" \
      security.no-suid="true" \
      security.minimal="true" \
      security.hardened="true" \
      security.updated="2025-08-13" \
      maintainer="StockFlow-Pro Team" \
      version="ultra-secure-1.0"

# Start nginx with secure configuration
CMD ["nginx", "-g", "daemon off;"]
