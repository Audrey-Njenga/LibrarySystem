const express = require('express');
const app = express();
const apiRouter = require('./config/router');
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/', apiRouter);
app.listen(process.env.PORT || '3000', ()=> {
    console.log(`App running on port: ${process.env.PORT || '3000'}`);
})