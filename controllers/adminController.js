const db = require('../models')

const imgur = require('imgur-node-api')
const userController = require('./userController')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const User = db.User
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = require('../services/adminService.js')

let adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  creatRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      return res.render('admin/create', {
        categories: categories
      })
    })

  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_msg', data['message'])
        return res.redirect('back')
      }
      req.flash('success_msg', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        return res.render('admin/create', {
          categories: categories,
          restaurant: restaurant.toJSON()
        })
      })
    })
  },

  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', "name didn't exist")
      res.redirect('back')
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
            req.flash('success_msg', 'restaurant was successfully update')
            return res.redirect('/admin/restaurants')
          }).catch(err => res.status(422).json(err))
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
          req.flash('success_msg', 'restaurant was successfully update')
          return res.redirect('/admin/restaurants')
        }).catch(err => res.status(422).json(err))
      })
    }
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  /////// user relation
  getUsers: (req, res) => {
    User.findAll({ raw: true }).then((users) => {
      for (let item in users) {
        users[item].role = 'admin'
        users[item].unrole = 'user';
        if (users[item].isAdmin == 0) {
          users[item].role = 'user'
          users[item].unrole = 'admin'
        }
      }
      return res.render('admin/users', { users: users })
    }).catch((err) => res.status(422).json(err))

  },

  putUsers: (req, res) => {
    User.findByPk(req.params.id).then((user) => {
      return user.update({
        isAdmin: !user.isAdmin
      })

    }).then(user => res.redirect('/admin/users'))
  }
}

module.exports = adminController