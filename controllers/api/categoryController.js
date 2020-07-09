const db = require('../../models')
const Category = db.Category
const categoriesService = require('../../services/categoriesService.js')


const categoriesController = {
  getCategories: (req, res) => {
    categoriesService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  },
  postCategory: (req, res) => {
    categoriesService.postCategory(req, res, (data) => {
      return res.json(data)
    })
  },
  putCategory: (req, res) => {
    categoriesService.putCategory(req, res, (data) => {
      return res.json(data)
    })
  },
  deleteCategory: (req, res) => {
    categoriesService.deleteCategory(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = categoriesController