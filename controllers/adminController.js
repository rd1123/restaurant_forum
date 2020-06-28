const fs = require('fs')
const db = require('../models')

const imgur = require('imgur-node-api')
const userController = require('./userController')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const User = db.User
const Restaurant = db.Restaurant
const Category = db.Category

let adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    }).then(restaurants => {
      return res.render('admin/restaurants', {
        restaurants: restaurants
      })
    })
  },

  creatRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', "name didn't exist")
      return res.redirect('back')
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
        }).then((restaurant) => {
          req.flash('success_msg', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        }).catch(err => res.status(422).json(err))
      })
    } else {
      return Restaurant.create({
        name: input.name,
        tel: input.tel,
        address: input.address,
        opening_hours: input.opening_hours,
        description: input.description,
        image: null
      }).then((restaurant) => {
        req.flash('success_msg', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        return res.render('admin/restaurant', {
          restaurant: restaurant
        })
      })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then((restaurant) => {
      return res.render('admin/create', {
        restaurant: restaurant
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
            image: file ? img.data.link : restaurant.image
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
          image: restaurant.image
        }).then(restaurant => {
          req.flash('success_msg', 'restaurant was successfully update')
          return res.redirect('/admin/restaurants')
        }).catch(err => res.status(422).json(err))
      })
    }
  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('/admin/restaurants')
          })
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