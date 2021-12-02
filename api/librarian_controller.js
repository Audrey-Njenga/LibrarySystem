const conn = require('../config/db');

exports.librarianLandingPage = (req, res, next) => {
    res.render('librarian');
}

exports.searchBook = (req, res, next) => {
    const { body } = req;
    param = body.searchParameter;
    conn.query(
        "SELECT * FROM `books` WHERE `title` LIKE ?",
        ['%'+param+'%'], function (err, books) {
            if (books.length > 0) {
                return res.render('librarian', {
                    'books': books
                });

            }else if (err) {
                res.render('librarian', { msg: err });
            }
            // res.render('librarian', {
            //     msg: 'Book not found'
            // })

        }
    );


}

exports.createBook = (req, res, next) => {
    const { body } = req;

    try {
        // check for repeated isbn, isbn is id
        conn.query("INSERT INTO `books`(`title`, `author`, `ISBN`) VALUES(?,?,?)", [body.title, body.author, body.ISBN], function (err, rows) {
            if (rows.affectedRows !== 1) {
                return res.render('librarian', {
                    error: 'Book registrations has failed.'
                });
            }

            res.render("librarian", {
                msg: 'Book successfully created.'
            });
        });


    }
    catch (e) {
        console.log(e);
    }
}