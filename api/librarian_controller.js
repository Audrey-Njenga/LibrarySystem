const conn = require('../config/db');

exports.librarianLandingPage = (req, res, next) => {
    res.render('librarian');
}

exports.searchBook = async (req, res, next) => {
    const { body } = req;
    book = body.bookTitle;
    author = body.author;
    bookId = body.bookId;
    const [row] = await conn.query(
        "SELECT * FROM `books` WHERE `title`=?" ||
        [bookTitle]
    );

    if (row.length >= 1) {
        return res.render('signup', {

        });
    }
}

exports.createBook = async (req, res, next) => {
    const { body } = req;

    try {
        const [rows] = await conn.query("INSERT INTO `books`(`title`, `author`, `ISBN`) VALUES(?,?,?)", [body.title, body.author, body.ISBN]);

        if (rows.affectedRows !== 1) {
            return res.render('librarian', {
                error: 'Book registrations has failed.'
            });
        }

        res.render("librarian", {
            msg: 'Book successfully created.'
        });
    }
    catch (e) {
        console.log(e);
    }
}