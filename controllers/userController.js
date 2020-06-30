const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    if (req.body.password !== req.body.passwordCheck) {
      req.flash('error_msg', '兩次密碼輸入不同!')
      return res.redirect('/signup')
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            req.flash('error_msg', '信箱重複!')
            return res.redirect('/signup')
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            }).then(user => {
              req.flash('success_msg', '成功註冊帳號!')
              return res.redirect('/signin')
            })
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_msg', '成功登入!')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_msg', '成功登出!')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    res.render('user')
  },
  editUser: (req, res) => {
    res.render('userEdit')
  },
  putUser: (req, res) => {
    res.send('put user')
  }
}
module.exports = userController