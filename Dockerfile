# Base image
FROM node:20.18.0-alpine3.19

# Define variables
ARG APP_NAME

# prepare pnpm
RUN npm install -g pnpm@9.12.3
RUN pnpm config set global-bin-dir "/usr/local/bin"
RUN pnpm config set store-dir /usr/local/share/pnpm-store
RUN pnpm add -g @nestjs/cli
RUN mkdir -p /usr/local/share/pnpm-store && chown -R node:node /usr/local/share/pnpm-store

# Create app directory
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN pnpm run build -- ${APP_NAME}

# Start the server using the production build
CMD [ "node", "dist/apps/${APP_NAME}/main.js" ]
