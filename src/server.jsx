// @flow

import express from 'express';
import http from 'http';
import path from 'path';
import { createStore } from 'redux';
import { Server as WebSocketServer } from 'uws';
import config from '../config';
import reducer from './reducers';

const app = express();
const server = http.Server(app);
const wss = new WebSocketServer({ server });

const store = createStore(reducer);

wss.on('connection', socket => {
  console.log('connect');
  socket.on('message', msg => {
    console.log(msg);
    store.dispatch(JSON.parse(msg));
    wss.clients.forEach(client => {
      client.send(msg);
    });
  });
});

server.listen(process.env.PORT || config.ports.express, () => {
  console.log(`listening on port ${process.env.PORT}` || config.ports.express);
});

console.log(__dirname)
app.use('/assets', express.static(
  path.join(__dirname, '../assets'),
));


let jsFile;
if (process.env.NODE_ENV === 'production') {
  jsFile = `/assets/${config.files.client.out}/${config.files.client.outFile}`;
} else {
  jsFile = `http://localhost:${config.ports.webpack}/${config.files.client.outFile}`;
}

app.use((req, res) => {
  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Transcribe Twitch</title>
    </head>
    <body>
      <div id="root"></div>
      <script async defer src="${jsFile}"></script>
      <script>window.INITIAL_STATE=${JSON.stringify(store.getState().toJS())}</script>
    </body>
  </html>`;
  res.send(html);
});
