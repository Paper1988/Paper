FROM node:20

RUN apt-get update && apt-get install -y build-essential python3 make

WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
