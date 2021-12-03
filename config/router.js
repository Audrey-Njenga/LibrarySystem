const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { body } = require('express-validator');
const { createBook, searchBook } = require('../api/librarian_controller');
const { signUp, signUpPage } = require('../api/user_controller');
const connection = require('../config/db');

var session, type;

/** 
 * User sign up controllers
 */

router.get('/signup', (req, res) => {
    session=req.session;
     if(session.userid){
        res.redirect('/')
    }else{
        res.render('signup.ejs')
    }
});

router.post('/signup', [
    body("firstName", "The name must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 3 }),
    body("lastName", "The name must be of minimum 3 characters length")
        .notEmpty()
        .escape()
        .trim()
        .isLength({ min: 3 }),
    body("email", "Invalid email address")
        .notEmpty()
        .escape()
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "The Password must be between 1-16 characters long and contain at least 3 special or uppercase characters and at least 2 numbers")
        .notEmpty()
        .trim()
],
    signUp);

/**
 * User login apis
 */

router.post('/login', (req, res) => {
    session=req.session;
     if(session.userid && type === 'librarian'){
        res.redirect('/')
    }else{
         var email = req.body.email;
    var password = req.body.password;
    try {
        if (email && password) {

            connection.query("SELECT * FROM `users` WHERE `email` = ? ", [email], function (err, results) {
                if (err) throw err;
                if (results.length > 0) {
                    //TODO: results[0].password is undefined

                    const validPassword = bcrypt.compareSync(password, results[0].password);

                    if (validPassword) {
                        session = req.session;
                        session.userid = email;
                        type = results[0].type;

                        if (results[0].type === 'admin') {
                            res.redirect(`/`);
                        } else if (results[0].type === 'librarian') {
                            res.redirect(`/`);
                        } else {
                            res.redirect(`/`);
                        }
                    } else {
                        error = 'invalid password'
                        res.render('login.ejs', { error: error })
                    }
                } else {
                    error = 'invalid email/password'
                    res.render('login.ejs', { error: error })
                }
                res.end();

            })



        } else {
            res.send('Please enter email and password');
            res.end();
        }
    }
    catch (e) {
        console.log(e);
    }
    }
   
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


/** 
 * Librarian controllers
 */

// router.get('/librarian', librarianLandingPage);

router.get('/librarian', (req, res) => {
    session=req.session;
    if(session.userid && type === 'librarian'){
            res.render('librarian.ejs')        
    }else{
        res.redirect('/');
    }
});

router.post('search',
    [body("parameter").notEmpty()
        .escape()
        .trim()],
    searchBook)

router.get('/regular', (req, res) => {
    res.render('regular');
})

router.get('/', (req, res) => {
    session = req.session;
     if (session.userid) {
       connection.query('SELECT * FROM users WHERE email = ?', [session.userid] ,(error, results) => {
            res.render('success.ejs', { user: results[0] });
        })         
    } else {
        res.render('login.ejs')
    }

});

router.post('/upload',
    [body("title").notEmpty()
        .escape()
        .trim(),
    body("author").notEmpty()
        .escape()
        .trim(),
    body("ISBN").notEmpty()
        .escape()
        .trim()], createBook)

router.post('/search',
    [body("searchParameter").notEmpty()
        .escape()
        .trim(),
    ], searchBook)

router.get('/view/:book', (req, res) => {
    console.log(req.params.book);
    res.render('viewbook', {"book" : req.params.book});
})

router.post('/update/:id', (req, res) => {

})

router.post('/lend/:id', (req, res) =>{ 

})
/**
 * Staff/Student controllers
 */

router.get('/regular', (req, res) => {
    session=req.session;
    if (session.userid && type === "regular") {
        res.render('regular.ejs')
    } else {
        res.redirect('/')
    }

});

/**
 * Admin controllers
 */

router.get('/admin', (req, res) => {
    session=req.session;
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users', (error, results) => {
            res.render('admin.ejs', { users: results });
        })
    } else {
        res.redirect('/')
    }

});

router.get('/create', (req, res) => {
    session=req.session;
    if (session.userid && type === "admin") {
        res.render('create.ejs');
    } else {
        res.redirect('/')
    }

})

router.post('/create/user', (req, res) => {
    session=req.session;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync('0000', salt);
    if (session.userid && type === "admin") {
        connection.query('INSERT INTO users (firstName, lastName, email, password, type) VALUES (?, ?, ?, ?, ?)', [req.body.firstName, req.body.lastName, req.body.email, hash, req.body.type], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

router.get('/update/:id', (req, res) => {
    session=req.session;
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.render('update.ejs', { user: results[0] });
        })
    } else {
        res.redirect('/')
    }

})

router.post('/update/privilege/:id', (req, res) => {
    session=req.session;
    if (session.userid && type === "admin") {
        connection.query('UPDATE users SET type=? WHERE id = ?', [req.body.type, req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

router.post('/remove/user/:id', (req, res) => {
    session=req.session;
    if (session.userid && type === "admin") {
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

module.exports = router;