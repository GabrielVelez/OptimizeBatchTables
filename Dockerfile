FROM node

WORKDIR /OptimizeBatchTables
COPY . .
RUN npm i -g @adonisjs/cli
RUN npm install
EXPOSE 1433/tcp

CMD [ "node","server.js"]