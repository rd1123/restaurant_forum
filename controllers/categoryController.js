const db = require('../models')
const Category = db.Category

module.exports = {
  getCategories: (req, res) => {
    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      return res.render('admin/categories', { categories: categories })
    })
  },

  postCategory: (req, res) => {
    console.log('post category')
    res.redirect('admin/categories')
  },

  putCategory: (req, res) => {
    res.send('put category')
  },

  deleteCategory: (req, res) => {
    res.send('delete category')
  }
}