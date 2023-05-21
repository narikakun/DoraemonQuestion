FROM node:18
# アプリケーションディレクトリを作成する
WORKDIR /usr/src/app
# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
COPY package*.json ./

RUN npm install --only=production

# アプリケーションのソースをバンドルする
COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]