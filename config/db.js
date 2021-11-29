const express = require('express');
require("dotenv").config();
const mysql = require('mysql2');

const connection = mysql.createPool({
    connectionLimit: 10,
    password: 'TY5chDgwy4z6jVdp',
    user: 'debian-sys-maint',
    database: 'LibrarySystem',
    host: 'localhost',
    port: '3306'
});

module.exports = connection.promise();