FROM node:16-alpine3.15

WORKDIR /OptimizeBatchTables
COPY . .
RUN npm i -g @adonisjs/cli
RUN npm install
EXPOSE 1433/tcp

CMD [ "adonis","serve","--dev"]