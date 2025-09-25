# syntax = docker/dockerfile:1

ARG NODE_VERSION="22.18.0"
ARG BASE_VERSION="alpine3.22"
ARG OLD_IMAGE="agent-builder-webapp:latest"
ARG KEEP_DAYS=60

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /app

# Add build arguments for env variables
ARG NEXUS_API_BASE_URL
ARG NEXUS_WEBSOCKET_BASE_URL
ARG SENTRY_URL
ARG SENTRY_ENVIRONMENT
ARG GROWTHBOOK_CLIENT_KEY
ARG GROWTHBOOK_API_HOST
ARG HOTJAR_ID
ARG PUBLIC_PATH_URL
ARG MODULE_FEDERATION_CONNECT_URL
ARG CONNECT_URL
ARG FF_SUPERVISOR_EXPORT
ARG BILLING_API_BASE_URL

# Set them as environment variables
ENV NEXUS_API_BASE_URL=${NEXUS_API_BASE_URL}
ENV NEXUS_WEBSOCKET_BASE_URL=${NEXUS_WEBSOCKET_BASE_URL}
ENV SENTRY_URL=${SENTRY_URL}
ENV SENTRY_ENVIRONMENT=${SENTRY_ENVIRONMENT}
ENV GROWTHBOOK_CLIENT_KEY=${GROWTHBOOK_CLIENT_KEY}
ENV GROWTHBOOK_API_HOST=${GROWTHBOOK_API_HOST}
ENV HOTJAR_ID=${HOTJAR_ID}
ENV PUBLIC_PATH_URL=${PUBLIC_PATH_URL}
ENV MODULE_FEDERATION_CONNECT_URL=${MODULE_FEDERATION_CONNECT_URL}
ENV CONNECT_URL=${CONNECT_URL}
ENV FF_SUPERVISOR_EXPORT=${FF_SUPERVISOR_EXPORT}
ENV BILLING_API_BASE_URL=${BILLING_API_BASE_URL}

RUN apk add --no-cache git

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm NPM_CONFIG_CACHE=/root/.npm npm install

COPY . ./

RUN npm run build

FROM ${OLD_IMAGE} AS old_css

FROM nginxinc/nginx-unprivileged:1.25-alpine
ARG OLD_IMAGE=${OLD_IMAGE}
ARG KEEP_DAYS

COPY --chown=nginx:nginx docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx docker/nginx/headers /usr/share/nginx/html/headers
COPY --chown=nginx:nginx docker/file_handler.sh /
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html/agent-builder/
#COPY --from=old_css --chown=nginx:nginx /usr/share/nginx/html/agent-builder/assets/all.tx[t] /usr/share/nginx/html/agent-builder/assets/*.css /usr/share/nginx/html/agent-builder/assets/

COPY docker/docker-entrypoint.sh /

RUN mv /usr/share/nginx/html/agent-builder/index.html /usr/share/nginx/html/agent-builder/index.html.tmpl \
    && cd /usr/share/nginx/html/agent-builder/ \
    && ln -s /tmp/index.html \
    && /file_handler.sh css

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
