const db = require('../models')
const Category = db.Category

const categoriesService = {
  getCategories: (req, res, callback) => {
    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id).then(category => {
          callback({
            categories: categories,
            category: category.toJSON()
          })
        })
      } else {
        callback({ categories: categories })
      }
    })
  },
  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: "name didn't exist" })
    } else {
      Category.create({
        name: req.body.name
      }).then(category => {
        return callback({ status: 'success', message: '' })
      })
    }
  },
  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error_msg', message: 'name didn\'t exist' })
    }
    Category.findByPk(req.params.id).then(category => {
      category.update(req.body).then(category => {
        return callback({ status: 'success', message: '' })
      })
    })
  },
  deleteCategory: (req, res, callback) => {
    Category.findByPk(req.params.id).then(category => {
      category.destroy().then(category => {
        return callback({ status: 'success', message: '' })
      })
    })
  }
}
module.exports = categoriesService