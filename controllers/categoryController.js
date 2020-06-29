const db = require('../models')
const Category = db.Category

module.exports = {
  getCategories: (req, res) => {
    let cateName = ''
    let putId = ''
    if (req.params.id) {
      Category.findByPk(req.params.id).then(category => {
        cateName = category.name
        putId = category.id
      })
    }

    Category.findAll({
      raw: true,
      nest: true,
    }).then(categories => {
      return res.render('admin/categories', { categories: categories, cateName, putId })
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
    Category.findByPk(req.params.id).then(category => {
      category.update({
        name: req.body.categoryName
      }).then(category => {
        return res.redirect('/admin/categories')
      }).catch(err => res.status(422).json(err))
    })

  },

  deleteCategory: (req, res) => {
    Category.findByPk(req.params.id).then(category => {
      category.destroy().then(category => {
        res.redirect('/admin/categories')
      })
    })
  }
}