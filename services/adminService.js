const db = require('../models')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const User = db.User
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurants => {
      callback({ restaurants: restaurants })
    })
  },
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurant => {
      callback({ restaurant: restaurant })
    })
  },
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: '' })
          })
      })
  },
  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const input = req.body
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: input.name,
          tel: input.tel,
          address: input.address,
          opening_hours: input.opening_hours,
          description: input.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
        }).then((restaurant) => {
          callback({ status: 'success', message: "restaurant was successfully created" })
        })
      })
    } else {
      return Restaurant.create({
        name: input.name,
        tel: input.tel,
        address: input.address,
        opening_hours: input.opening_hours,
        description: input.description,
        image: null,
        CategoryId: req.body.categoryId
      }).then((restaurant) => {
        callback({ status: 'success', message: "restaurant was successfully created" })
      })
    }
  },
  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    }

    const input = req.body
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then((restaurant) => {
          restaurant.update({
            name: input.name,
            tel: input.tel,
            address: input.address,
            description: input.description,
            opening_hours: input.opening_hours,
            image: file ? img.data.link : restaurant.image,
            CategoryId: req.body.categoryId
          }).then(restaurant => {
            return callback({ status: 'success', message: "restaurant was successfully update" })
          })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id).then((restaurant) => {
        restaurant.update({
          name: input.name,
          tel: input.tel,
          address: input.address,
          description: input.description,
          opening_hours: input.opening_hours,
          image: restaurant.image,
          CategoryId: req.body.categoryId
        }).then(restaurant => {
          return callback({ status: 'success', message: 'restaurant was successfully update' })
        })
      })
    }
  },
  getUsers: (req, res, callback) => {
    return User.findAll({ raw: true }).then((users) => {
      callback({ users: users })
    })
  },
  putUsers: (req, res, callback) => {
    User.findByPk(req.params.id).then((user) => {
      user.update({
        isAdmin: !user.isAdmin
      }).then(user => {
        callback({ status: 'sucess', message: 'user was successfully to update' })
      })
    })
  }
}
module.exports = adminService