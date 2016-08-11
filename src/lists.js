// useful for monitoring
import _ from 'lodash';
import client from './app.js';
import async from 'async';
import redis from 'redis';

export const init = (app, client) => {

  client.get('listId', (err, response) => {
    if (response !== null) {
      console.log('OK');
    }
    else {
      client.set('listId', 0);
      console.log('DONE');
    }
  });

  app.get('/lists', (req, res) => {
    client.smembers('lists', (err, response) => {
      if (err) return console.log('smembers error', err);
      async.map(response, (list, callback) => {
        client.hgetall(list, (err, result) => {
          if (err) return callback('hgetall error:', err);
          callback(null, result);
        })
      },
      (err, data) => {
        res.json(data);
      });
    });
  });

  app.post('/lists', (req, res) => {

  client.get('listId', (err, id) => {
    if (err) return console.log('post:', err);
    client.incr('listId');

    client.hset(`list${ id }`, 'id', id);
    client.hset(`list${ id }`, 'label', req.body.todo.label);
    client.sadd('lists', [`list${ id }`]);
    
    res.json({id, label: req.body.todo.label });
    });
  });

  app.put('/lists', (req, res) => {
    const target = _.omit(lists, req.body.id);
    const rename = ({ [req.body.id]: { id: req.body.id, label: req.body.todo.label } })
    res.send( rename );
  });

  app.delete('/lists/:id', (req, res) => {
    client.smembers('lists', (err, response) => {
      if (err) return console.log('smembers error', err);
      async.map(response, (list, callback) => {
        client.hgetall(list, (err, result) => {
          if (err) return callback('hgetall error:', err);
          callback(null, result);
        })
      },
      (err, data) => {
        if (err) return console.log('delete', err);
        const del = _.omit(data, req.params.id);
        client.hdel(`list${ req.params.id }`, 'id');
        client.hdel(`list${ req.params.id }`, 'label');
        client.srem('lists', [`list${ req.params.id }`]);
        res.json(del); 
      });
    });
  });
};


