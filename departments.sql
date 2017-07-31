CREATE TABLE departments (
  department_id INT(11) UNSIGNED AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(30) NOT NULL,
  over_head_costs DECIMAL(12, 2) NOT NULL,
  PRIMARY KEY(department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ('Classics', 1489.54), ('Computer Science', 1283.22), ('Science Fiction', 1322.79), ('Young Adult Fiction', 1189.45), ('Electronics', 978.29), ('Magazines', 896.78);

ALTER TABLE products
ADD COLUMN product_sales DECIMAL(12, 2);
