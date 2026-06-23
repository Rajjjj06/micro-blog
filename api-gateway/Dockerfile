FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN addgroup -g 1001 app4
RUN adduser -D -u 1001 -G app4 user4
COPY . .
RUN chown -R user4:app4 /app
USER user4
EXPOSE 4005
CMD ["node", "index.js"]