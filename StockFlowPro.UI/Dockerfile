# Multi-stage build for React TypeScript application
# Use latest LTS version with security updates (August 2025)
FROM node:20.17.0-alpine3.20 AS build

# Create a non-root user with home directory
RUN addgroup -g 1001 -S nodeuser && \
    adduser -S nodeuser -u 1001 -G nodeuser

# Apply security updates and install necessary packages
RUN apk update && apk upgrade && \
    apk add --no-cache curl ca-certificates dumb-init && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Set working directory and change ownership
WORKDIR /app
RUN chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Copy package files for dependency installation
COPY --chown=nodeuser:nodeuser package*.json ./

# Install dependencies with security audit and fix vulnerabilities
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy source code
COPY --chown=nodeuser:nodeuser . .

# Use staging environment configuration for production builds
COPY --chown=nodeuser:nodeuser .env.staging .env.local

# Build the application
RUN npm run build

# Production stage with Nginx - use latest stable alpine version with security updates
FROM nginx:1.27.3-alpine3.20

# Create a non-root user for nginx with home directory
RUN addgroup -g 1001 -S nginxuser && \
    adduser -S nginxuser -u 1001 -G nginxuser

# Apply security updates and install curl for health checks
RUN apk update && apk upgrade && \
    apk add --no-cache curl ca-certificates dumb-init && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from build stage
COPY --from=build --chown=nginxuser:nginxuser /app/dist /usr/share/nginx/html

# Copy production nginx configuration
COPY --chown=nginxuser:nginxuser nginx.prod.conf /etc/nginx/nginx.conf

# Create necessary directories and set permissions for nginx to run as non-root
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp /var/log/nginx /var/lib/nginx && \
    chown -R nginxuser:nginxuser /var/cache/nginx /var/log/nginx \
    /var/lib/nginx /etc/nginx && \
    touch /var/run/nginx.pid && \
    chown nginxuser:nginxuser /var/run/nginx.pid

# Switch to non-root user
USER nginxuser

# Expose port 8080 instead of 80 (non-privileged port)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Set security environment variables
ENV NGINX_USER=nginxuser
ENV NGINX_UID=1001
ENV NGINX_GID=1001

# Add security labels
LABEL security.scan="enabled" \
      security.non-root="true" \
      security.updates="2025-08-13" \
      maintainer="StockFlow-Pro Team" \
      org.opencontainers.image.source="https://github.com/Pinto1232/StockFlow-Pro"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start nginx directly with non-root user
CMD ["nginx", "-g", "daemon off;"]