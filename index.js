const express = require('express');
const sessions = require('express-session');
const cookieParser = require("cookie-parser");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// const salt = bcrypt.genSaltSync(saltRounds);
// const hash = bcrypt.hashSync('123456789', salt);
// console.log(hash);


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
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'library'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get('/',(req,res) => {
    session=req.session;
    if(session.userid){
        res.send('Welcome' + session.userid);
    }else{
        res.render('login.ejs')
    }
    
});

// app.post('/signup',(req,res) => {
//     var username = req.body.username;
//     var email = req.body.email;
//     var password = req.body.password;
//     if(username && password && email){
//         const salt = bcrypt.genSaltSync(saltRounds);
//         const hash = bcrypt.hashSync(password, salt);
//         connection.query(
//             'INSERT INTO users (username, email, password, type) VALUES (?, ?, ?, ?), [username, email, hash, 'default'], (error, results) => {}
//         )

//     }
    
// });

app.post('/login', (req, res) => {
    var username = req.body.username;
	var password = req.body.password;

	if (username && password) {
		connection.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', [username, username], (error, results) => {
			if (results.length > 0) {
                const validPassword = bcrypt.compareSync(password, results[0].password);

                if(validPassword){
                    session=req.session;
                    session.userid = username;
                    type=results[0].type;

                    if(results[0].type === 'admin'){                   
                        res.redirect(`/admin`);
                    }else if(results[0].type === 'librarian'){
                        res.redirect(`/librarian`);
                    }else{
                        res.redirect(`/regular`);
                    }
                }else{
                    error = 'invalid password'
				    res.render('login.ejs', {error: error})
                }
			} else {
                error = 'invalid username/password'
				res.render('login.ejs', {error: error})
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});


app.get('/admin',(req,res) => {
    // session=req.session;
    if(session.userid && type==="admin"){
        res.render('admin.ejs')
    }else{
        res.redirect('/')
    }
    
});

app.get('/librarian',(req,res) => {
    // session=req.session;
    if(session.userid && type==="librarian"){
        res.render('librarian.ejs')
    }else{
        res.redirect('/')
    }
    
});

app.get('/regular',(req,res) => {
    // session=req.session;
    if(session.userid && type==="regular"){
        res.render('regular.ejs')
    }else{
        res.redirect('/')
    }
    
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});