const express = require('express');
require("dotenv").config();
const mysql = require('mysql2');

const connection = mysql.createPool({
    connectionLimit: 10,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USERNAME,
    database: process.env.DATABASE,
    host: 'localhost',
    port: process.env.DB_PORT,
});

module.exports = connection.promise();