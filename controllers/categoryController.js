const db = require('../models')
const Category = db.Category

module.exports = {
  getCategories: (req, res) => {
    res.send('all category')
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