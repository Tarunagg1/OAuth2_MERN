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


exports.activationController = (req, res) => {
    const { token } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    errors: 'Expired link. Signup again'
                });
            } else {
                const { name, email, password } = decoded;

                const user = new User({
                    name,
                    email,
                    password
                });


                user.save((err, user) => {
                    if (err) {
                        console.log(err);
                        //   console.log('Save error', errorHandler(err));
                        return res.status(401).json({
                            errors: errorHandler(err)
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: user,
                            message: 'Signup success'
                        });
                    }
                });
            }
        });
    } else {
        return res.json({
            errors: 'error happening please try again'
        });
    }
};



exports.loginControlller = async (req, res) => {
    const { password } = req.body;
    const errors = validationResult(req);

    try {

        if (!errors.isEmpty()) {
            const firstError = errors.array().map(error => error.msg)[0];
            return res.status(422).json({
                errors: firstError
            });
        }

        const isUser = await User.findOne({ emdil: req.body.email });

        console.log(isUser);
        if (!isUser) {
            return res.status(400).json({
                success: false,
                errors: "user with that  email does't exists"
            });
        }

        if (!isUser.authenticate(password)) {
            return res.status(400).json({
                success: false,
                errors: "Invalid password"
            });
        }

        // generate a token and send to client
        const token = jwt.sign(
            {
                _id: isUser._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        const { _id, name, email, role } = isUser;

        return res.json({
            token,
            user: {
                _id,
                name,
                email,
                role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'error happening please try again'
        });
    }
}


const client = new OAuth2Client(process.env.GOOGLE_CLIENT);

exports.googleLoginControlller = (req, res) => {
    const { idToken } = req.body;
    console.log(idToken);
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
        .then((response) => {
            const { email, verified, name } = response.payload;

            User.findOne({ email })
                .exec((err, user) => {
                    if (user) {
                        // generate a token and send to client
                        const token = jwt.sign(
                            {
                                _id: user._id
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: '7d'
                            }
                        );
                        const { _id, name, email, role } = user;

                        return res.json({
                            token,
                            user: {
                                _id,
                                name,
                                email,
                                role
                            }
                        });
                    } else {
                        // if user not exist
                        const password = email + Math.random().toString();
                        const newuser = new User({ name, email, password });
                        newuser.save((err, user) => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    error: errorHandler(err)
                                });
                            }
                            const { _id, name, email, role } = user;

                            const token = jwt.sign(
                                {
                                    _id: user._id
                                },
                                process.env.JWT_SECRET,
                                {
                                    expiresIn: '7d'
                                }
                            )

                            return res.json({
                                token,
                                user: {
                                    _id,
                                    name,
                                    email,
                                    role
                                }
                            });
                        })
                    }
                });
        })
        .catch((err) => {
            console.log('rerere');
            console.log(err);
            if (err) {
                return res.status(400).json({
                    success: false,
                    error: "Google login failed"
                });
            }
        })
}



exports.facebookController = (req, res) => {
    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return (
        fetch(url, {
            method: 'GET'
        })
            .then(response => response.json())
            // .then(response => console.log(response))
            .then(response => {
                const { email, name } = response;
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                            expiresIn: '7d'
                        });
                        const { _id, email, name, role } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role }
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        user = new User({ name, email, password });
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with facebook'
                                });
                            }
                            const token = jwt.sign(
                                { _id: data._id },
                                process.env.JWT_SECRET,
                                { expiresIn: '7d' }
                            );
                            const { _id, email, name, role } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role }
                            });
                        });
                    }
                });
            })
            .catch(error => {
                res.json({
                    error: 'Facebook login failed. Try later'
                });
            })
    );
};
