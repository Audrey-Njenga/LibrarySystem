const bcrypt = require('bcrypt');
const conn = require('../config/db');
const { validationResult } = require('express-validator');

exports.signUpPage = (req, res, next) => {
    res.render('pages/signup');
}

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;
    if (!errors.isEmpty()) {
        return res.render('pages/signup', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await conn.query(
            "SELECT * FROM `users` WHERE `email`=?",
            [body._email]
        );

        if (row.length >= 1) {
            return res.render('pages.signup', {
                error: 'This email already in use.'
            });
        }

        const hashPass = await bcrypt.hash(body.password, 12);

        const [rows] = await conn.query(
            "INSERT INTO `users`(`firstName`, `lastName`, `email`,`password`) VALUES(?,?,?,?)",
            [body.firstName, body.lastName, body.email, hashPass]
        );

        if (rows.affectedRows !== 1) {
            return res.render('pages/signup', {
                error: 'Your registration has failed.'
            });
        }
        
        res.render("pages/signup", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }

}


