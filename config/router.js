const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signUp, signUpPage } = require('../controllers/user_controller');


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
        .isEmail(),
    body("password", "The Password must be of minimum 4 characters length")
        .notEmpty()
        .trim()
        .isLength({ min: 4 }),
],
    signUp);
router.get('/', (req, res) => {
    session = req.session;
    if (session.userid) {
        if (results[0].type === 'admin') {
            res.send('Hello Admin!');
        } else if (results[0].type === 'librarian') {
            res.send('Hello Librariam!');
        } else {
            res.send('Hello Student/staff');
        }
    } else {
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

router.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    if (username && password) {
        connection.query(
            'SELECT * FROM users WHERE username = ? OR email = ?', [username, username], (error, results) => {
                if (results.length > 0) {
                    const validPassword = bcrypt.compareSync(password, results[0].password);

                    if (validPassword) {
                        session = req.session;
                        session.userid = username;
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
                    error = 'invalid username/password'
                    res.render('login.ejs', { error: error })
                }
                res.end();
            });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});


router.get('/admin', (req, res) => {
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users', (error, results) => {
            res.render('admin.ejs', { users: results });
        })
    } else {
        res.redirect('/')
    }

});

router.get('/librarian', (req, res) => {
    // session=req.session;
    if (session.userid && type === "librarian") {
        res.render('librarian.ejs')
    } else {
        res.redirect('/')
    }

});

router.get('/regular', (req, res) => {
    // session=req.session;
    if (session.userid && type === "regular") {
        res.render('regular.ejs')
    } else {
        res.redirect('/')
    }

});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
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
        connection.query('INSERT INTO users (username, email, password, type) VALUES (?, ?, ?, ?)', [req.body.username, req.body.email, hash, req.body.type], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

app.get('/update/:id', (req, res) => {
    if (session.userid && type === "admin") {
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.render('update.ejs', { user: results[0] });
        })
    } else {
        res.redirect('/')
    }

})

app.post('/update/privilege/:id', (req, res) => {
    if (session.userid && type === "admin") {
        connection.query('UPDATE users SET type=? WHERE id = ?', [req.body.type, req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

app.post('/remove/user/:id', (req, res) => {
    if (session.userid && type === "admin") {
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (error, results) => {
            res.redirect('/admin')
        })
    } else {
        res.redirect('/')
    }

})

module.exports = router;