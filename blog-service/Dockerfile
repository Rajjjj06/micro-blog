FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN addgroup -g 1001 app2
RUN adduser -D -u 1001 -G app2 user2
COPY . .
RUN chown -R user2:app2 /app
USER user2
EXPOSE 4001
CMD ["node", "index.js"]