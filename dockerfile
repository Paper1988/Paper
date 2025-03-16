FROM jrottenberg/ffmpeg:latest

# 設置工作目錄
WORKDIR /app

# 複製您的應用程序代碼
COPY . .

# 安裝 Node.js 和其他依賴
RUN apt-get update && apt-get install -y nodejs npm

# 安裝應用程序依賴
RUN npm install

# 啟動應用程序
CMD ["node", "index.js"]