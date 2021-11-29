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


module.exports = router;