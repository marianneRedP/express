import path from 'path';
import http from 'http';
import async from 'async';
import {default as bodyParser} from 'body-parser';
import express from 'express';
import {init as initPing} from './ping';
import {init as initVersion} from './version';
import { init as initLists } from './lists';
import { init as initTasks } from './tasks';
import redis from 'redis';
const client = redis.createClient();


const url = (host, server) => 'http://' + host + ':' + server.address().port;

export function start(config, resources, cb) {
  const app = express();
  const httpServer = http.createServer(app);

  function stop(cb) {
    httpServer.close(() => {
      console.log('HTTP server stopped.');
      httpServer.unref(); 
      cb();
    });
  }

  async.parallel({
    // init http depending on param.js
    http(cb) {
      const { port, host } = config;
      httpServer.listen(port, host, () => {
        console.log(`HTTP server listening on: ${url(host, httpServer)}`);
        cb();
      });
    },
  }, function(err) {
    if (err) return cb(err);

  //check redis client
    client.on('error', err => {
      console.log('error', err);
    });
    

    // register middleware, order matters

    //generator 500
 //   app.use((req, res) => {
 //     res.sendFile('./proc_error500');
//});

    app.use((req, res, next) => {
      console.log(Date.now()+'::'+req.method+'::'+req.originalUrl);
      next();
    });

    //handler 500
    app.use(function(err, req, res, next) {
      console.error(err.stack);
      res.sendStatus(500).send({error: err.message });
    });

   
    // remove for security reason
    app.disable('x-powered-by');
    
    // usually node is behind a proxy, will keep original IP
    app.enable('trust proxy');

    // register bodyParser to automatically parse json in req.body and parse url
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    app.use(bodyParser.json({limit: '10mb', extended: true}));



    // CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
       if (req.method === 'OPTIONS') {
        res.sendStatus(200);
       } 
       else {
        next();
      }
    });

    initPing(app);
    initVersion(app, resources);
    initLists(app, client);
    initTasks(app, client);

    //handler 404
    app.use(function(req, res, next) {
      res.sendStatus(404).send({error: 'not found' });
    });

    
    cb(null, { stop, url: url(config.host, httpServer) });
  });
}
