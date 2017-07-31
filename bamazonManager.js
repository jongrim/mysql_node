'use strict';
const mysql = require('mysql2');
const inquirer = require('inquirer');
const Table = require('cli-table');
const config = require('./config.js');
const isValidNumber = require('./utils.js').isValidNumber;

const connection = mysql.createConnection(config);

function viewProducts() {
  return new Promise(function(resolve, reject) {
    connection.query('SELECT * FROM products', (err, results, fields) => {
      if (err) throw err;
      let columns = fields.map(field => field.name);
      let table = new Table({
        head: columns,
        colWidths: [8, 15, 15, 8, 15, 15]
      });
      results.forEach(row => {
        table.push([
          row.item_id,
          row.product_name,
          row.department_name,
          row.price,
          row.stock_quantity,
          row.product_sales
        ]);
      });
      console.log(table.toString());
    });
    resolve();
  });
}

function viewLowInventory() {
  return new Promise(function(resolve, reject) {
    connection.query('SELECT * FROM products WHERE stock_quantity < 5', (err, results, fields) => {
      if (err) throw err;
      let columns = fields.map(field => field.name);
      console.log(...columns);
      results.forEach(row => {
        console.log(row.item_id, row.product_name, row.department_name, row.price, row.stock_quantity);
      });
    });
    resolve();
  });
}

function addInventory(item_id, quantity) {
  return new Promise(function(resolve, reject) {
    connection.execute(
      'UPDATE `products` SET `stock_quantity` = stock_quantity + ? WHERE `item_id`=?',
      [quantity, item_id],
      (err, results, fields) => {
        if (err) throw err;
        console.log(results);
      }
    );
    resolve();
  });
}

function addNewProduct({ product_name, department_name, price, stock_quantity } = {}) {
  return new Promise(function(resolve, reject) {
    connection.execute(
      'INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales) VALUES (?, ?, ?, ?, ?)',
      [product_name, department_name, price, stock_quantity, 0],
      function(err, results, fields) {
        if (err) throw err;
        resolve();
      }
    );
  });
}

function managerActions() {
  return new Promise(function(resolve, reject) {
    inquirer
      .prompt([
        {
          name: 'options',
          message: 'Select you operation:',
          type: 'list',
          choices: ['View products', 'View low inventory', 'Add to inventory', 'Add new product']
        }
      ])
      .then(answers => {
        switch (answers.options) {
          case 'View products':
            viewProducts().then(() => {
              resolve('Closing connection');
            });
            break;
          case 'View low inventory':
            viewLowInventory().then(() => {
              resolve('Closing connection');
            });
            break;
          case 'Add to inventory':
            addStockPrompt().then(() => {
              resolve('Closing connection');
            });
            break;
          case 'Add new product':
            addNewProductPrompt().then(() => {
              resolve('Closing connection');
            });
            break;
        }
      });
  });
}

function addStockPrompt() {
  return new Promise(function(resolve, reject) {
    inquirer
      .prompt([
        {
          name: 'item_id',
          message: 'Enter the item number for which you would like to add stock',
          validate: isValidNumber
        },
        {
          name: 'quantity',
          message: 'Enter the quantity to add',
          validate: isValidNumber
        }
      ])
      .then(answers => {
        addInventory(answers.item_id, answers.quantity).then(() => {
          resolve();
        });
      });
  });
}

function addNewProductPrompt() {
  return new Promise(function(resolve, reject) {
    inquirer
      .prompt([
        {
          name: 'product_name',
          message: 'Enter the product name:'
        },
        {
          name: 'department_name',
          message: 'Enter the department name:'
        },
        {
          name: 'price',
          message: 'Enter the price:',
          validate: isValidNumber
        },
        {
          name: 'stock_quantity',
          message: 'Enter the stock quantity:',
          validate: isValidNumber
        }
      ])
      .then(answers => {
        addNewProduct({
          product_name: answers.product_name,
          department_name: answers.department_name,
          price: parseFloat(answers.price).toFixed(2),
          stock_quantity: parseInt(answers.stock_quantity)
        }).then(() => {
          resolve();
        });
      });
  });
}

managerActions().then(msg => {
  console.log(msg);
  connection.end();
});
