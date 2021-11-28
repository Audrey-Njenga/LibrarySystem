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
        if(results[0].type === 'admin'){                   
            res.send('Hello Admin!');
        }else if(results[0].type === 'librarian'){
            res.send('Hello Librariam!');
        }else{
            res.send('Hello Student/staff');
        }
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
    if(session.userid && type==="admin"){
        connection.query('SELECT * FROM users', (error, results) => {
            res.render('admin.ejs', {users: results});
        })
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



app.get('/create', (req, res) => {
    if(session.userid && type==="admin"){
       res.render('create.ejs');
    }else{
        res.redirect('/')
    }

})

app.post('/create/user', (req, res) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync('0000', salt);
    if(session.userid && type==="admin"){
        connection.query('INSERT INTO users (username, email, password, type) VALUES (?, ?, ?, ?)', [req.body.username, req.body.email, hash, req.body.type] ,(error, results) => {
            res.redirect('/admin')
        })
    }else{
        res.redirect('/')
    }
    
})

app.get('/update/:id', (req, res) => {
    if(session.userid && type==="admin"){
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id] ,(error, results) => {
            res.render('update.ejs', {user: results[0]});
        })
    }else{
        res.redirect('/')
    }
    
})

app.post('/update/privilege/:id', (req, res) => {
    if(session.userid && type==="admin"){
        connection.query('UPDATE users SET type=? WHERE id = ?', [req.body.type, req.params.id] ,(error, results) => {
            res.redirect('/admin')
        })
    }else{
        res.redirect('/')
    }
    
})

app.post('/remove/user/:id', (req, res) => {
    if(session.userid && type==="admin"){
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id] ,(error, results) => {
            res.redirect('/admin')
        })
    }else{
        res.redirect('/')
    }
    
})