const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const User = mongoose.model('User');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are successfully logged in'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/login');
};

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }

    req.flash('error', 'Oops. You should logged in');
    res.redirect('/login');
};

exports.account = (req, res) => {
    res.render('account', { title: 'Edit Your Account' })
};

exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        req.flash('error', 'No account with that email exists');
        return res.redirect('/login');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + (2 * 60 * 60 * 1000);
    await user.save();
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    mail.send({
        user,
        subject: 'Password Reset',
        filename: 'password-reset',
        resetURL
    });
    req.flash('success', `You have been emailed password. reset link is on your mail adress ${user.email}`);
    res.redirect('/login');
};

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }

    res.render('reset', { title: 'Reset your password' });
};

exports.confirmPasswords = (req, res, next) => {
    if (req.body['password'] === req.body['password-confirm']) {
        return next();
    }

    req.flash('error', 'password dont match');
    res.redirect('back');
};

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'Password has been reset');
    res.redirect('/');
};