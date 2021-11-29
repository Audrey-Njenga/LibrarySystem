const bcrypt = require('bcrypt');
const conn = require('../config/db');
const { validationResult } = require('express-validator');
const joiPassword = require('joi-password-complexity');
const complexityOptions = {
    min: 8, max: 16,
    uppercase: 1, numeric: 1, symbol: 1
};

exports.signUpPage = (req, res, next) => {
    res.render('signup');
}

exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;
    if (!errors.isEmpty()) {
        return res.render('signup', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await conn.query(
            "SELECT * FROM `users` WHERE `email`=?",
            [body.email]
        );

        if (row.length >= 1) {
            return res.render('signup', {
                error: 'This email already in use.'
            });
        }
        
        if (joiPassword(complexityOptions).validate(body.password) === false)
        {
            return res.render('signup', {
                error: 'The password must be of length 8-16 with at least one uppercase, one number and one special character'
            })
        }
        
        const hashPass = await bcrypt.hashSync(body.password, 10);

        const [rows] = await conn.query(
            "INSERT INTO `users`(`firstName`, `lastName`, `email`,`password`) VALUES(?,?,?,?)",
            [body.firstName, body.lastName, body.email, hashPass]
        );

        if (rows.affectedRows !== 1) {
            return res.render('signup', {
                error: 'Your registration has failed.'
            });
        }
        
        res.render("signup", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }

}


