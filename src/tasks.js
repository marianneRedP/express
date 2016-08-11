// useful for monitoring
import _ from 'lodash';
import client from './app.js';
import async from 'async';

export const init = (app, client) => {
 client.get('taskId', (err, response) => {
    if (response !== null) {
      console.log('OK');
    }
    else {
      client.set('taskId', 0);
      console.log('DONE');
    }
  });

 app.get('/tasks', (req, res) => {
    client.smembers('tasks', (err, response) => {
      if (err) return console.log('smembers error', err);
      async.map(response, (task, callback) => {
        client.hgetall(task, (err, result) => {
          if (err) return callback('hgetall error:', err);
          callback(null, result);
        })
      },
      (err, data) => {
        res.json(data);
      });
    });
  });

 app.post('/tasks', (req, res) => {

  client.get('taskId', (err, id) => {
    if (err) return console.log('post:', err);
    client.incr('taskId');
    
    client.hset(`task${ id }`, 'id', id);
    client.hset(`task${ id }`, 'listId', req.body.task.listId);
    client.hset(`task${ id }`, 'description', req.body.task.description);
    client.sadd('tasks', [`task${ id }`]);
    
    res.json({id, listId: req.body.task.listId, description: req.body.task.description });
    });
  });

 app.put('/tasks', (req, res) => {
    const target = _.omit(tasks, req.body.id);
    const rename = ({...target, [req.body.id]: { id: req.body.id, description: req.body.task.description, listId: req.body.task.listId } });
    res.json( rename );
  });

 app.delete('/tasks/:id', (req, res) => {
    client.smembers('tasks', (err, response) => {
      if (err) return console.log('smembers error', err);
      async.map(response, (task, callback) => {
        client.hgetall(task, (err, result) => {
          if (err) return callback('hgetall error:', err);
          callback(null, result);
        })
      },
      (err, data) => {
        if (err) return console.log('delete', err);
        const del = _.omit(data, req.params.id);
        client.hdel(`task${ req.params.id }`, 'id');
        client.hdel(`task${ req.params.id }`, 'listId');
        client.hdel(`task${ req.params.id }`, 'description');
        client.srem('tasks', [`task${ req.params.id }`]);
        res.json(del); 
      });
    });
  });
};
