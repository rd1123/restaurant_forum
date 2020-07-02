const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite

const imgur = require('imgur-node-api')
const { putUsers } = require('./adminController')
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
    if (req.params.id != req.user.id) {
      req.flash('error_msg', '未具有相關權限')
      return res.redirect(`/users/${req.user.id}`)
    }

    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant }
      ]
    }).then(userResult => {
      const data = userResult.Comments.map(item => (item.Restaurant.dataValues))
      return res.render('user', { userResult: data })

    })
  },
  editUser: (req, res) => {
    if (req.params.id != req.user.id) {
      req.flash('error_msg', '未具有相關權限')
      return res.redirect(`/users/${req.user.id}`)
    }
    res.render('userEdit')
  },
  putUser: (req, res) => {
    if (req.params.id != req.user.id) {
      req.flash('error_msg', '未具有相關權限')
      return res.redirect(`/users/${req.user.id}`)
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.user.id).then(user => {
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image
          }).then(user => {
            res.redirect(`/users/${req.params.id}`)
          })
        })
      })
    } else {
      return User.findByPk(req.user.id).then(user => {
        user.update({
          name: req.body.name,
          image: user.image
        }).then(user => {
          res.redirect(`/users/${req.params.id}`)
        })
      })
    }
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(favorite => {
      res.redirect('back')
    })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      favorite.destroy().then(restaurant => {
        return res.redirect('back')
      })
    })
  }
}
module.exports = userController