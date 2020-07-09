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
  }
}
module.exports = categoriesService