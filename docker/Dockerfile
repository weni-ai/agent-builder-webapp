# syntax = docker/dockerfile:1

ARG NODE_VERSION="22.18.0"
ARG BASE_VERSION="alpine3.22"
ARG OLD_IMAGE="agent-builder-webapp:latest"
ARG KEEP_DAYS=60

FROM node:${NODE_VERSION}-${BASE_VERSION} AS builder

WORKDIR /app

# Add build arguments for env variables
ARG PUBLIC_PATH_URL
ARG MODULE_FEDERATION_CONNECT_URL
ARG ENVIRONMENT

# Set them as environment variables
ENV PUBLIC_PATH_URL=${PUBLIC_PATH_URL}
ENV MODULE_FEDERATION_CONNECT_URL=${MODULE_FEDERATION_CONNECT_URL}
ENV ENVIRONMENT=${ENVIRONMENT}

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
COPY --from=old_css --chown=nginx:nginx /usr/share/nginx/html/agent-builder/assets/all.tx[t] /usr/share/nginx/html/agent-builder/assets/*.css /usr/share/nginx/html/agent-builder/assets/

COPY docker/docker-entrypoint.sh /

RUN mv /usr/share/nginx/html/agent-builder/index.html /usr/share/nginx/html/agent-builder/index.html.tmpl \
    && cd /usr/share/nginx/html/agent-builder/ \
    && ln -s /tmp/index.html \
    && /file_handler.sh css

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
