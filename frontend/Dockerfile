# Multistage Dockerfile for React frontend deployment

## [Stage 1] - Build production app
# Base image
FROM node:18.9-bullseye-slim as BUILDER_LAYER
# Set env vars to production
ENV NODE_ENV production
# Set run user
USER node
# Create working directory
WORKDIR /usr/src/app
# Move files into docker and chown
COPY --chown=node:node . /usr/src/app
# Install dependencies
RUN npm ci --omit=dev
# Compile App for prod deployment
RUN npm run build

## [Stage 2] - Utilize nginx web server to deploy [Stage 1]
# Base web server image
FROM nginx:stable
# Copy [Stage 1] build
COPY --from=BUILDER_LAYER /usr/src/app/build /usr/share/nginx/html