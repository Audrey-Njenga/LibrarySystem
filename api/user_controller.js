const bcrypt = require('bcrypt');
const conn = require('../config/db');
const { validationResult } = require('express-validator');
const joiPassword = require('joi-password-complexity');
const complexityOptions = {
    min: 8, max: 16,
    uppercase: 1, numeric: 1, symbol: 1
};

exports.signUp = (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;
    if (!errors.isEmpty()) {
        return res.render('signup', {
            error: errors.array()[0].msg
        });
    }

    try {

        conn.query(
            "SELECT * FROM `users` WHERE `email`=?",
            [body.email], function (err, results) {
                if (results.affectedRows >= 1) {
                    return res.render('signup', {
                        error: 'This email already in use.'
                    });
                }

            }
        );



        if (!joiPassword(complexityOptions).validate(body.password)) {
            return res.render('signup', {
                error: 'The password must be of length 8-16 with at least one uppercase, one number and one special character'
            })
        }

        const hashPass = bcrypt.hashSync(body.password, 10);

        conn.query(
            "INSERT INTO `users`(`firstName`, `lastName`, `email`,`password`) VALUES(?,?,?,?)",
            [body.firstName, body.lastName, body.email, hashPass], function (err, rows) {
                if (rows.affectedRows !== 1) {
                    return res.render('signup', {
                        error: 'Your registration has failed.'
                    });
                }

                res.render("signup", {
                    msg: 'You have successfully registered.'
                });
            }
        );



    } catch (e) {
        next(e);
    }

}


