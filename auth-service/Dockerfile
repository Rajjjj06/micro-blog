FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN addgroup -g 1001 app1
RUN adduser -D -u 1001 -G app1 app1
COPY . .
RUN chown -R app1:app1 /app
USER app1
EXPOSE 4000
CMD ["node", "index.js"]