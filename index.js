const express = require('express');
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
	secret: 'secret',
	saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

// a variable to save a session
app.use(cookieParser());
var session;
var type;


app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const apiRouter = require('./config/router');
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/', apiRouter);
app.listen(process.env.PORT || '3000', ()=> {
    console.log(`App running on port: ${process.env.PORT || '3000'}`);
})