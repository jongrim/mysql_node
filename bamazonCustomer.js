'use strict';
const mysql = require('mysql2');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bamazon'
});

function getAllProducts() {
  return new Promise(function(resolve, reject) {
    connection.query('SELECT * FROM products', function(err, results, fields) {
      if (err) throw err;
      let columns = [];
      fields.forEach(field => {
        columns.push(field.name);
      });
      console.log(...columns);
      results.forEach(row => {
        console.log(row.item_id, row.product_name, row.department_name, row.price, row.stock_quantity);
        resolve(true);
      });
    });
  });
}

function checkItemQuantity(item_id, quantity) {
  return new Promise(function(resolve, reject) {
    connection.execute(
      'SELECT `stock_quantity`, `price` FROM `products` WHERE `item_id` = ?',
      [item_id],
      (err, results, fields) => {
        if (results[0].stock_quantity >= quantity) {
          resolve({
            item_id: item_id,
            quantity: quantity,
            stock_quantity: results[0].stock_quantity,
            price: results[0].price
          });
        } else {
          reject('Insufficient quantity!');
        }
      }
    );
  });
}

function purchaseItem(item_id, purchaseQuantity, stockQuantity, price) {
  return new Promise(function(resolve, reject) {
    let newQuant = stockQuantity - purchaseQuantity;
    connection.execute(
      'UPDATE `products` SET `stock_quantity`= ? WHERE `item_id` = ?',
      [newQuant, item_id],
      (err, results, fields) => {
        if (err) reject(err);
        let purchasePrice = (purchaseQuantity * parseFloat(price)).toFixed(2);
        console.log(`${purchaseQuantity} items purchase for a total of $${purchasePrice}`);
        resolve(true);
      }
    );
  });
}

function isValidNumber(answer) {
  let num = Number.parseInt(answer);
  if (Number.isInteger(num) && !Number.isNaN(num)) {
    return true;
  }
}

function endConnection() {
  connection.end(err => {
    if (err) throw err;
    console.log('Session terminated gracefully');
  });
}

getAllProducts().then(() => {
  goShopping();
});

function goShopping() {
  inquirer
    .prompt([
      {
        name: 'item_id',
        message: 'What item would you like to buy (supply item_id)',
        validate: isValidNumber
      },
      {
        name: 'quantity',
        message: 'How many units would you like?',
        validate: isValidNumber
      }
    ])
    .then(answers => {
      return checkItemQuantity(answers.item_id, answers.quantity);
    })
    .then(item => {
      return purchaseItem(item.item_id, item.quantity, item.stock_quantity, item.price);
    })
    .then(() => {
      endConnection();
    })
    .catch(err => {
      console.log(err);
      endConnection();
    });
}
