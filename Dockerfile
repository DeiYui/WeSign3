# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

# Stage 2: Run (production image)
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy build output từ builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Chạy ở production
CMD ["yarn", "start"]
