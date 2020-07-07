const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Followship = db.Followship
const Like = db.Like

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
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        { model: Restaurant, as: 'FavoritedRestaurants' }
      ]
    }).then(userResult => {
      const data = userResult.Comments.map(item => (item.Restaurant.dataValues))
      const isFollowed = req.user.Followings.some(item => item.id === userResult.dataValues.id)
      return res.render('user', { userResult: data, user: userResult.dataValues, isFollowed })
    })
  },
  editUser: (req, res) => {
    if (req.params.id != req.user.id) {
      req.flash('error_msg', '未具有相關權限')
      return res.redirect('back')
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
      Restaurant.findByPk(favorite.RestaurantId).then(restaurant => {
        restaurant.increment('favoriteCount').then(restaurant => {
          res.redirect('back')
        })
      })
    })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      Restaurant.findByPk(favorite.RestaurantId).then(restaurant => {
        restaurant.decrement('favoriteCount').then(restaurant => {
          favorite.destroy().then(restaurant => {
            return res.redirect('back')
          })
        })
      })
    })
  },

  getLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(likes => {
      res.redirect('back')
    })
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(likes => {
      likes.destroy().then(likes => {
        res.redirect('back')
      })
    })
  },

  getTopUser: (req, res) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.some(d => d.id === user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => {
      return res.redirect('back')
    })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        return res.redirect('back')
      })
    })
  }

}
module.exports = userController