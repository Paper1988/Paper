FROM node:22

# 安裝 FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製應用程序代碼
COPY . .

# 啟動應用程序
CMD ["node", "index.js"]