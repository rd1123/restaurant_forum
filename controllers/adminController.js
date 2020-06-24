const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant

let adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true }).then(restaurants => {
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
      const uploadPath = `upload/${file.originalname}`
      input.image = '/' + uploadPath

      // resave to upload
      const data = fs.readFileSync(file.path)
      fs.writeFileSync(uploadPath, data)
    }
    Restaurant.create(input).then((restaurant) => {
      req.flash('success_msg', 'restaurant was successfully created')
      return res.redirect('/admin/restaurants')
    }).catch(err => res.status(422).json(err))
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
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
      const uploadPath = `upload/${file.originalname}`
      input.image = '/' + uploadPath

      const data = fs.readFileSync(file.path)
      fs.writeFileSync(uploadPath, data)
    }
    Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.update({
        name: input.name,
        tel: input.tel,
        address: input.address,
        description: input.description,
        opening_hours: input.opening_hours,
        image: input.image
      })
    }).then(restaurant => {
      req.flash('success_msg', 'restaurant was successfully created')
      return res.redirect('/admin/restaurants')
    }).catch(err => res.status(422).json(err))

  },

  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('/admin/restaurants')
          })
      })
  }
}

module.exports = adminController