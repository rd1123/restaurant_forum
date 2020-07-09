const db = require('../../models')
const Category = db.Category
const categoriesService = require('../../services/categoriesService.js')


const categoriesController = {
  getCategories: (req, res) => {
    categoriesService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = categoriesController