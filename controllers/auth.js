// const User = require('../models').User
const User = 1;
const bcrypt = require('bcryptjs')
require('dotenv').config()
const jwt = require('jsonwebtoken')

const renderSignup = (req, res) => {
    res.render('users/signup.ejs')
}

const signup = (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).json(err)

        bcrypt.hash(req.body.password, salt, (err, hashedPwd) => {
            if (err) return res.status(500).json(err)
            req.body.password = hashedPwd

            User.create(req.body)
                .then(newUser => {
                    const token = jwt.sign(
                        {
                            username: newUser.username,
                            id: newUser.id
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "30 days",
                        }
                    )

                    res.cookie("jwt", token)
                    res.json({message: "Signed up"})
                    // res.redirect(`/users/profile/${newUser.id}`);
                })
                .catch(err => {
                    console.log(err);
                    res.send(`error ${err}`)
                })
        })

    })
}

const renderLogin = (req, res) => {
    res.render('users/login.ejs')
}

const login = (req, res) => {
    User.findOne({
        where: {
            username: req.body.username
        }
    })
        .then(foundUser => {
            if (foundUser) {
                bcrypt.compare(req.body.password, foundUser.password, (err, match) => {
                    if (match) {
                        const token = jwt.sign(
                            {
                                username: foundUser.username,
                                id: foundUser.id
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "30 days",
                            }
                        )

                        // res.cookie("jwt", token)
                        res.json(token)
                    } else {
                        return res.sendStatus(400)
                    }
                })
            }
        })
}

module.exports = {
    renderSignup,
    signup,
    renderLogin,
    login
}