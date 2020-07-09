const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  moment: function (a) {
    return moment(a).fromNow()
  },

  ifno: function (a, options) {
    if (a.length === 0) {
      return options.fn(this)
    }
  }
}