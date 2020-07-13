const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Followship = db.Followship
const Like = db.Like

const imgur = require('imgur-node-api')
const { putUsers } = require('../controllers/adminController')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

let userController = {
  getUser: (req, res, callback) => {
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
      callback({ userResult: data, user: userResult.dataValues, isFollowed })
    })
  },
  putUser: (req, res, callback) => {
    if (req.params.id != req.user.id) {
      callback({ status: 'error', message: '未具有相關權限' })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        User.findByPk(req.user.id).then(user => {
          user.update({
            name: req.body.name,
            image: file ? img.data.link : user.image
          }).then(user => {
            callback({ status: 'success', message: 'Update successfully' })
          })
        })
      })
    } else {
      User.findByPk(req.user.id).then(user => {
        user.update({
          name: req.body.name,
          image: user.image
        }).then(user => {
          callback({ status: 'success', message: 'Update successfully' })
        })
      })
    }
  },
  addFavorite: (req, res, callback) => {
    Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(favorite => {
      Restaurant.findByPk(favorite.RestaurantId).then(restaurant => {
        restaurant.increment('favoriteCount').then(restaurant => {
          callback({ status: 'success', message: '' })
        })
      })
    })
  },
  removeFavorite: (req, res, callback) => {
    Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(favorite => {
      Restaurant.findByPk(favorite.RestaurantId).then(restaurant => {
        restaurant.decrement('favoriteCount').then(restaurant => {
          favorite.destroy().then(restaurant => {
            callback({ status: 'success', message: '' })
          })
        })
      })
    })
  },
  getLike: (req, res, callback) => {
    Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then(likes => {
      callback({ status: 'success', message: '' })
    })
  },
  removeLike: (req, res, callback) => {
    Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    }).then(likes => {
      likes.destroy().then(likes => {
        callback({ status: 'success', message: '' })
      })
    })
  },
  getTopUser: (req, res, callback) => {
    User.findAll({
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
      callback({ status: 'success', message: '', users: users })
    })
  },
  addFollowing: (req, res, callback) => {
    Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    }).then(followship => {
      callback({ status: 'success', message: '' })
    })
  },
  removeFollowing: (req, res, callback) => {
    Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    }).then(followship => {
      followship.destroy().then(followship => {
        callback({ status: 'success', message: '' })
      })
    })
  }

}

module.exports = userController