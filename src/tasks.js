// useful for monitoring
import _ from 'lodash';

const tasks = [ { id: 0, listId: 0, description: 'task1' },
                { id: 1, listId: 0, description: 'task2' },
                { id: 2, listId: 3, description: 'task3' },
                { id: 3, listId: 1, description: 'task4' },
              ];

let taskId = 3;

export const init = (app) => {
  app.get('/tasks', (req, res) => {
    res.json(tasks);
  });
  app.post('/tasks', (req, res) => {
    taskId = taskId + 1;
    const createdTask = { id: taskId, listId: req.body.task.listId, description: req.body.task.description };

    console.log(createdTask);
    res.json({ createdTask });
  });
  app.put('/tasks', (req, res) => {
    const target = _.omit(tasks, req.body.id);
    const rename = ({...target, [req.body.id]: { id: req.body.id, description: req.body.task.description, listId: req.body.task.listId } });
    res.json({ rename });
  });
  app.delete('/tasks/:id', (req, res) => {
    const taskToDelete = _.omit(tasks, req.params.id);
    res.json({ taskToDelete });
  });
};
