const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { body } = require('express-validator');
const { librarianLandingPage, createBook, searchBook } = require('../api/librarian_controller');
const { signUp, signUpPage } = require('../api/user_controller');
const connection = require('../config/db');



/** 
 * User sign up controllers
 */

router.get('/signup', signUpPage);

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
                            res.redirect(`/admin`);
                        } else if (results[0].type === 'librarian') {
                            res.redirect(`/librarian`);
                        } else {
                            res.redirect(`/regular`);
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
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});


/** 
 * Librarian controllers
 */

router.get('/librarian', librarianLandingPage);

// router.get('/librarian', (req, res) => {
//     // session=req.session;
//     if (session.userid && type === "librarian") {
//         res.render('librarian.ejs')
//     } else {
//         res.redirect('/')
//     }

// });

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
        // TODO: check type
        // if (results[0].type === 'admin') {
        //     res.send('Hello Admin!');
        // } else if (results[0].type === 'librarian') {
        //     res.send('Hello Librarian!');
        // } else {
        //     res.send('Hello Student/Staff!');
        // }
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

/**
 * Staff/Student controllers
 */

router.get('/regular', (req, res) => {
    // session=req.session;
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
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users', (error, results) => {
            res.render('admin.ejs', { users: results });
        })
    } else {
        res.redirect('/')
    }

});

router.get('/create', (req, res) => {
    if (session.userid && type === "admin") {
        res.render('create.ejs');
    } else {
        res.redirect('/')
    }

})

router.post('/create/user', (req, res) => {
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
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.render('update.ejs', { user: results[0] });
        })
    } else {
        res.redirect('/')
    }

})

router.post('/update/privilege/:id', (req, res) => {
    if (session.userid && type === "admin") {
        connection.query('UPDATE users SET type=? WHERE id = ?', [req.body.type, req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

router.post('/remove/user/:id', (req, res) => {
    if (session.userid && type === "admin") {
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

module.exports = router;