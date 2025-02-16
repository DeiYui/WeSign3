FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first for caching dependencies
COPY yarn.lock package.json ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build the application
RUN yarn build

EXPOSE 3000

# Set the command to run the application
CMD ["yarn", "dev"]

