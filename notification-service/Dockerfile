FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN addgroup -g 1001 app3
RUN adduser -D -u 1001 -G app3 user3
COPY . .
RUN chown -R user3:app3 /app
USER user3
EXPOSE 4002
CMD ["node", "index.js"]