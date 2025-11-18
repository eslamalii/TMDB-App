FROM node:25-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies to save space
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]