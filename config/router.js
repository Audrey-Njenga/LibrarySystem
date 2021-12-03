const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { body } = require('express-validator');
const { createBook, searchBook, regularSearch } = require('../api/librarian_controller');
const { signUp } = require('../api/user_controller');
const connection = require('../config/db');

var session, type;

/** 
 * User sign up controllers
 */

router.get('/signup', (req, res) => {
    session = req.session;
    if (session.userid) {
        res.redirect('/')
    } else {
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
    body("password", "The Password must be between 8-16 characters long and contain at least 1 special character, 1 uppercase character and at least 1 number")
        .notEmpty()
        .trim()
],
    signUp);

/**
 * User login apis
 */

router.post('/login', (req, res) => {
    session = req.session;
    if (session.userid && type === 'librarian') {
        res.redirect('/')
    } else {
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
    session = req.session;
    if (session.userid && type === 'librarian') {
        res.render('librarian.ejs')
    } else {
        res.redirect('/');
    }
});

router.post('/search',
    [body("parameter").notEmpty()
        .escape()
        .trim()],
    searchBook)

router.get('/regular', (req, res) => {
    res.render('regular');
})

router.post('/regularSearch',
    [body("parameter").notEmpty()
        .escape()
        .trim()],
    regularSearch)


router.get('/', (req, res) => {
    session = req.session;
    if (session.userid) {
        connection.query('SELECT * FROM users WHERE email = ?', [session.userid], (error, results) => {
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

router.get('/viewBook/:id', (req, res) => {
    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
        if (err) { throw err; };
        res.render('viewbook', { book: book[0] });
    })

})

router.post('/updateBook/:id', (req, res) => {
    const { body } = req;
    try {
        connection.query('UPDATE books SET title=?, author=?, ISBN=? WHERE id = ?', [body.title, body.author, body.ISBN, req.params.id],
            function (err, rows) {
                if (err) {
                    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
                        if (err) { throw err; };
                        res.render('viewbook', { book: book[0], error: "Failed to update" });
                    })

                }
                if (rows.affectedRows >= 1) {
                    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
                        if (err) { throw err; };
                        res.render('viewbook', { book: book[0], msg: "Updated successfully" });
                    })
                }
            })
    }
    catch (err) {
        throw (err);
    }
})

router.post('/deleteBook/:id', (req, res) => {
    try {
        connection.query(connection.query('DELETE FROM books WHERE id = ?', [req.params.id],

            function (err, rows) {
                if (err) {
                    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
                        if (err) { throw err; };
                        res.render('viewbook', { book: book[0], error: err });
                    })

                }
                if (rows.affectedRows >= 1) {
                    res.render('librarian')
                }

            })
        )
    }
    catch (err) {
        throw (err);
    }
})
/**
 * Staff/Student controllers
 */

router.get('/regular', (req, res) => {
    session = req.session;
    if (session.userid && type === "regular") {
        res.render('regular.ejs')
    } else {
        res.redirect('/')
    }

});

router.get('/borrowBook/:id', (req, res) => {
    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
        if (err) { throw err; };
        res.render('borrow', { book: book[0] });
    })
})

router.post('/borrow/:id', (req, res) => {
   const { body } = req;
   var today = new Date();

   if(body.returnDate <= today){
    try {
        connection.query('UPDATE books SET borrowDate=?, returnDate=?, status=? WHERE id=?', [today, body.returnDate, 1, req.params.id],
            function (err, rows) {
                if (err) {
                    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
                        if (err) { throw err; };
                        res.render('borrow', { book: book[0], error: "Failed to update" });
                    })

                }
                if (rows.affectedRows >= 1) {
                    connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
                        if (err) { throw err; };
                        res.render('borrow', { book: book[0], msg: "Updated successfully" });
                    })
                }
            })
    }
    catch (err) {
        throw (err);
    }
   }
   else{
  
        connection.query('SELECT * FROM `books` WHERE `id`=?', [req.params.id], function (err, book) {
            if (err) { throw err; };
            res.render('borrow', { book: book[0], error: "Borrow date must be later that today" });
        })

    
   }
})

/**
 * Admin controllers
 */

router.get('/admin', (req, res) => {
    session = req.session;
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users', (error, results) => {
            res.render('admin.ejs', { users: results });
        })
    } else {
        res.redirect('/')
    }

});

router.get('/create', (req, res) => {
    session = req.session;
    if (session.userid && type === "admin") {
        res.render('create.ejs');
    } else {
        res.redirect('/')
    }

})

router.post('/create/user', (req, res) => {
    session = req.session;
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
    session = req.session;
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.render('update.ejs', { user: results[0] });
        })
    } else {
        res.redirect('/')
    }

})

router.post('/update/privilege/:id', (req, res) => {
    session = req.session;
    if (session.userid && type === "admin") {
        connection.query('UPDATE users SET type=? WHERE id = ?', [req.body.type, req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

router.post('/remove/user/:id', (req, res) => {
    session = req.session;
    if (session.userid && type === "admin") {
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

module.exports = router;