'use strict';
const _ = require('lodash');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const config = require('./config.js');
const isValidNumber = require('./utils.js').isValidNumber;

const connection = mysql.createConnection(config);

function getAllProducts() {
  return new Promise(function(resolve, reject) {
    connection.query('SELECT * FROM products', function(err, results, fields) {
      if (err) reject(err);
      let columns = fields.map(field => field.name);
      console.log(...columns.slice(0, columns.length - 2));
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
        if (err) return reject(err);
        if (results.length === 0) {
          return reject('No results!');
        }
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
    let purchaseTotal = (purchaseQuantity * parseFloat(price)).toFixed(2);
    connection.execute(
      'UPDATE products SET stock_quantity = ?, product_sales = product_sales + ? WHERE item_id = ?',
      [newQuant, purchaseTotal, item_id],
      (err, results, fields) => {
        if (err) reject(err);
        let purchasePrice = (purchaseQuantity * parseFloat(price)).toFixed(2);
        console.log(`${purchaseQuantity} items purchased for a total of $${purchasePrice}`);
        resolve(true);
      }
    );
  });
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
