const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const Comment = db.Comment
const pageLimit = 10

let restController = {
  getRestaurants: (req, res) => {
    let whereQuery = {}
    let categoryId = ''
    let offset = 0

    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset: offset, limit: pageLimit }).then(results => {
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(results.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1

      const data = results.rows.map(r => ({
        ...r.dataValues,
        description: (r.dataValues.description == null) ? '' : r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.some(d => d.id === r.id),
        isLiked: req.user.LikedRestaurants.some(d => d.id === r.id)
      }))

      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          page: page, totalPage: totalPage, next: next, prev: prev,
          categoryId: categoryId,
        })
      })
    })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.some(d => d.id === req.user.id)
      const isLiked = restaurant.LikedUsers.some(d => d.id === req.user.id)
      const isFavoritedtest = restaurant.FavoritedUsers.map(d => d.id)
      restaurant.increment('viewCount').then(restaurant => {
        return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
      })
    })
  },

  getFeeds: (req, res) => {
    return Restaurant.findAll({
      limit: 10,
      raw: true,
      nest: true,
      order: [['createdAt', 'DESC']],
      include: [Category]
    }).then(restaurants => {
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
      }).then(comments => {
        return res.render('feeds', { restauratns: restaurants, comments: comments })
      })
    })
  },

  getDashboard: (req, res) => {
    Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: [User] }
      ]
    }).then(restaurant => {
      console.log(restaurant)
      res.render('dashboard', { restaurant: restaurant.toJSON() })
    })
  },

  getTopRestaurants: (req, res) => {
    Restaurant.findAll({
      limit: 10,
      raw: true,
      nest: true,
      order: [['favoriteCount', 'DESC']],
    }).then(restaurants => {
      const data = restaurants.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.some(d => d.id === r.id),
        isLiked: req.user.LikedRestaurants.some(d => d.id === r.id)
      }))
      res.render('topRestaurants', { restaurants: data })
    })

  }
}

module.exports = restController