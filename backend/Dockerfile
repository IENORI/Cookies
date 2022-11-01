## [Stage 1] - Build production app
# Base image
FROM node:18-alpine as BUILDER_LAYER
# Set env vars to production
ENV NODE_ENV production
# Expose Port
EXPOSE 5000
# Create working directory
WORKDIR /usr/src/app
# Move files into docker and chown
COPY --chown=node:node . /usr/src/app
# Install dependencies
RUN npm ci --omit=dev
# Run
CMD ["/bin/sh", "-c", "node server.js"]