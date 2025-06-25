const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(express.static('.'));
app.use(bodyParser.json());

// Лог действий
function logAction(action, productName) {
  const entry = {
    action,
    product: productName,
    time: new Date().toISOString()
  };

  fs.readFile('stats.json', 'utf8', (err, data) => {
    let stats = [];

    if (!err && data) {
      stats = JSON.parse(data);
    }

    stats.push(entry);

    fs.writeFile('stats.json', JSON.stringify(stats), () => {});
  });
}

// Отдать список товаров
app.get('/catalogData', (req, res) => {
  fs.readFile('catalog.json', 'utf8', (err, data) => {
    res.send(data);
  });
});

// Добавить в корзину
app.post('/addToCart', (req, res) => {
  fs.readFile('cart.json', 'utf8', (err, data) => {
    if (err) {
      res.send('{"result": 0}');
    } else {
      const cart = JSON.parse(data);
      const item = req.body;

      cart.push(item);

      fs.writeFile('cart.json', JSON.stringify(cart), (err) => {
        if (err) {
          res.send('{"result": 0}');
        } else {
          logAction('added', item.product_name);
          res.send('{"result": 1}');
        }
      });
    }
  });
});

// Удалить из корзины
app.post('/removeFromCart', (req, res) => {
  fs.readFile('cart.json', 'utf8', (err, data) => {
    if (err) {
      res.send('{"result": 0}');
    } else {
      let cart = JSON.parse(data);
      const itemToRemove = req.body.product_name;

      cart = cart.filter(item => item.product_name !== itemToRemove);

      fs.writeFile('cart.json', JSON.stringify(cart), (err) => {
        if (err) {
          res.send('{"result": 0}');
        } else {
          logAction('removed', itemToRemove);
          res.send('{"result": 1}');
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log('server is running on port 3000!');
});
