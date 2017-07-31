'use strict';
const inquirer = require('inquirer');
const mysql = require('mysql2');
const Table = require('cli-table');

const config = require('./config.js');
const isValidNumber = require('./utils.js').isValidNumber;
const formatCurrency = require('./utils.js').formatCurrency;

const connection = mysql.createConnection(config);

function viewProductSales() {
  return new Promise(function(resolve, reject) {
    connection.query(
      'SELECT d.department_id as `Dept ID`, d.department_name as `Dept Name`, d.over_head_costs as `Overhead Costs`, SUM(p.product_sales) as `Product Sales`\
      FROM products p, departments d WHERE p.department_name = d.department_name\
      GROUP BY d.department_id\
      ORDER BY d.department_id ASC',
      function(err, results, fields) {
        if (err) {
          reject(err);
        } else {
          let columns = fields.map(field => field.name);
          columns.concat(['Total Profit']);
          let table = new Table({
            head: columns,
            colWidths: [12, 18, 18, 18, 18]
          });
          results.forEach(row => {
            let total_profit = (row['Product Sales'] - row['Overhead Costs']).toFixed(2);
            table.push([
              row['Dept ID'],
              row['Dept Name'],
              formatCurrency(row['Overhead Costs']),
              formatCurrency(row['Product Sales']),
              formatCurrency(total_profit)
            ]);
          });
          console.log(table.toString());
          resolve(true);
        }
      }
    );
  });
}

function addNewDepartment(department_name, overhead_costs) {
  return new Promise(function(resolve, reject) {
    connection.execute(
      'INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)',
      [department_name, overhead_costs],
      function(err, results, fields) {
        if (err) reject(err);
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

function supervisorActions() {
  return new Promise(function(resolve, reject) {
    inquirer
      .prompt([
        {
          name: 'action',
          message: 'Please select your action',
          type: 'list',
          choices: ['View product sales', 'Add department']
        }
      ])
      .then(answers => {
        switch (answers.action) {
          case 'View product sales':
            return viewProductSales();
          case 'Add department':
            return addDeptPrompt();
        }
      })
      .then(results => {
        return;
      })
      .then(() => {
        endConnection();
      })
      .catch(err => {
        console.log(err);
      });
  });
}

function addDeptPrompt() {
  return new Promise(function(resolve, reject) {
    inquirer
      .prompt([
        {
          name: 'name',
          message: 'Enter department name'
        },
        {
          name: 'costs',
          message: 'Enter overhead costs',
          validate: isValidNumber
        }
      ])
      .then(answers => {
        resolve(addNewDepartment(answers.name, answers.costs));
      });
  });
}

supervisorActions();
