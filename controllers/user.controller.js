const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Login Form' });
};

exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register Form' });
};

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply the name').notEmpty();
    req.checkBody('email', 'That mail is not valid').notEmpty().isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be black').notEmpty();
    req.checkBody('password-confirm', 'Password confirm cannot be black').notEmpty();
    req.checkBody('password-confirm', 'Oops! Your password dont match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        req.flash('error', errors.map(e => e.msg));
        return res.render('register', {
            title: 'Register',
            flashes: req.flash(),
            body: req.body
        });
    }

    next();
};

exports.register = async (req, res, next) => {
    const user = new User({
        email: req.body.email,
        name: req.body.name
    });
    const register = promisify(User.register, User);
    await register(user, req.body.password);

    next();
};

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: updates },
        { new: true, runValidators: true, context: 'query' }
    );

    req.flash('success', 'updated');
    res.redirect('/account');
};