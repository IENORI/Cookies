# Multistage Dockerfile for React frontend deployment

## [Stage 1] - Build production app
# Base image
FROM node:18-alpine as BUILDER_LAYER
# Set env vars to production
ENV NODE_ENV production
# Create working directory
WORKDIR /usr/src/app
# Move files into docker and chown
COPY --chown=node:node . /usr/src/app
# Install dependencies
RUN npm ci --omit=dev
# Expose Port
EXPOSE 3000
# Compile App for prod deployment
RUN npm run build

## [Stage 2] - Utilize nginx web server to deploy [Stage 1]
# Base web server image
FROM nginx:stable-alpine
# Expose Port
EXPOSE 3000
# Copy [Stage 1] build
COPY --from=BUILDER_LAYER /usr/src/app/build /usr/share/nginx/html
# Copy nginx conf
COPY ./default.conf /etc/nginx/conf.d