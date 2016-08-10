// useful for monitoring
import _ from 'lodash';

const lists = [ { id: 0, label: 'liste1' },
                { id: 1, label: 'liste2' },
                { id: 2, label: 'liste3' },
                { id: 3, label: 'liste4' },
              ];

let listId = 3;

export const init = (app) => {
  app.get('/lists', (req, res) => {
    res.json(lists);
  });
  app.post('/lists', (req, res) => {
    listId = listId + 1;
    console.log('listId = ', listId);
    const createdList = { id: listId, label: req.body.todo.label };
    console.log(createdList);
    console.log(req.headers);
    res.json({ createdList });
  });
  app.put('/lists', (req, res) => {
    const target = _.omit(lists, req.body.id);
    const rename = ({ [req.body.id]: { id: req.body.id, label: req.body.todo.label } })
    res.send({ rename });
  });
  app.delete('/lists/:id', (req, res) => {
    const listToDelete = _.omit(lists, req.params.id);
    res.send({ listToDelete });
  });
};
