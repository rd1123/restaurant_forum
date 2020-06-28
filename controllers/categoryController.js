const db = require('../models')
const Category = db.Category

module.exports = {
  getCategories: (req, res) => {
    let cateName = ''
    if (req.params.id) {
      Category.findByPk(req.params.id).then(category => {
        cateName = category.name
      })
    }

    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      return res.render('admin/categories', { categories: categories, cateName })
    })
  },

  postCategory: (req, res) => {
    if (!req.body.categoryName) {
      req.flash('error_msg', "name didn't exist")
      res.redirect('back')
    }
    Category.create({
      name: req.body.categoryName
    }).then(category => {
      return res.redirect('/admin/categories')
    })
  },

  putCategory: (req, res) => {
    res.send('put category')
  },

  deleteCategory: (req, res) => {
    res.send('delete category')
  }
}