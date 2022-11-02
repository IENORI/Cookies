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

## [Stage 2] - Shift only necessary stuff from [Stage 1] into lightweight base
FROM gcr.io/distroless/nodejs18-debian11
COPY --from=BUILDER_LAYER /usr/src/app /app
WORKDIR /app
CMD ["server.js"]