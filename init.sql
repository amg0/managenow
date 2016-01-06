-- CREATE DATABASE testdb;
-- CREATE USER 'amg0'@'localhost' IDENTIFIED BY 'Clem0tine';
-- GRANT ALL PRIVILEGES ON testdb.* TO 'amg0'@'localhost';
-- FLUSH PRIVILEGES;

USE testdb;
SET sql_mode='STRICT_ALL_TABLES';
-- also set in /etc/mysql/my.conf file   sql-mode=STRICT_ALL_TABLES

DROP TABLE  IF EXISTS users;

CREATE TABLE users (
  id int unsigned NOT NULL AUTO_INCREMENT,
  first_name varchar(50) DEFAULT '',
  last_name varchar(50) NOT NULL,
  email varchar(50) NOT NULL,
  location varchar(50) DEFAULT '',
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

INSERT INTO users (id, first_name, last_name, email, location) VALUES
(1, 'Jasmine', 'Jas','jasmine.jas@toto.com','Australia'),
(2, 'James', 'West','james.west@toto.com','Australia'),
(3, 'Artemus', 'Gordon','artemus.gordon@toto.com','Australia');


DROP TABLE  IF EXISTS projects;

CREATE TABLE projects (
  id int unsigned NOT NULL AUTO_INCREMENT,
  project_name varchar(50) NOT NULL,
  prod_date date NOT NULL,
  project_manager int unsigned,
  PRIMARY KEY (id)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

INSERT INTO projects (id, project_name, prod_date, project_manager) VALUES
(1, 'Biztalk Migration', '2016-1-31', 1),
(2, 'Snow rel4', '2016-3-31', NULL);
