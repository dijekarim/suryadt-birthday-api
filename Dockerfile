FROM node:16.13-slim

# Add waiter
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

WORKDIR /app
RUN npm cache clear --force
COPY package.json .
COPY package-lock.json .
RUN node -v
RUN npm -v
RUN npm install
COPY . .
EXPOSE 5000