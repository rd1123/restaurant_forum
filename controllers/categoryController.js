const db = require('../models')
const Category = db.Category
const categoriesService = require('../services/categoriesService.js')


module.exports = {
  getCategories: (req, res) => {
    categoriesService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },

  postCategory: (req, res) => {
    if (!req.body.categoryName) {
      req.flash('error_msg', "name didn't exist")
      return res.redirect('back')
    } else {
      Category.create({
        name: req.body.categoryName
      }).then(category => {
        return res.redirect('/admin/categories')
      })
    }
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_msg', 'name didn\'t exist')
      return res.redirect('back')
    } else {

    }
    return Category.findByPk(req.params.id).then(category => {
      category.update(req.body).then(category => {
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