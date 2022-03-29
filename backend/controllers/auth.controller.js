const User = require('../models/auth.model')
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');
const { validationResult } = require('express-validator');
const { errorHandler } = require('../helpers/dbErrorHandling');
const { commonMailFunctionToAll } = require('../lib/mailer');



exports.registerController = async (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0];
        return res.status(422).json({
            errors: firstError
        });
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    errors: 'Email is taken'
                });
            }
        });

        const token = jwt.sign(
            {
                name,
                email,
                password
            },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: '5m'
            }
        );

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Account activation link',
            html: `
                  <h1>Please use the following to activate your account</h1>
                  <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                  <hr />
                  <p>This email may containe sensetive information</p>
                  <p>${process.env.CLIENT_URL}</p>
              `
        };

        const resp = await commonMailFunctionToAll(emailData);

        if (resp) {
            return res.json({
                message: `Email has been sent to ${email}`
            });
        } else {
            return res.status(400).json({
                success: false,
                errors: errorHandler(err)
            });
        }
    }
}