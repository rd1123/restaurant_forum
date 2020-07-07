'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Restaurants', 'favoriteCount',
      {
        type: Sequelize.INTEGER,
        defaultValue: 0
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Restaurants', 'favoriteCount')
  }
};
