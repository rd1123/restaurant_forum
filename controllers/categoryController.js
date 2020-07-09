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
    categoriesService.postCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_msg', data['message'])
        return res.redirect('back')
      }
      return res.redirect('/admin/categories')
    })
  },

  putCategory: (req, res) => {
    categoriesService.putCategory(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_msg', data['message'])
        return res.redirect('back')
      }
      return res.redirect('/admin/categories')
    })
  },

  deleteCategory: (req, res) => {
    categoriesService.deleteCategory(req, res, (data) => {
      return res.redirect('/admin/categories')
    })
  }
}