/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const ProfitLoss2ndI18n = sequelize.define('ProfitLoss2ndI18n', {
        profitLoss2ndId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'profit_loss_2nd_id',
        },   
        languageId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'language_id',
        },  
        name: {
            type: DataTypes.STRING(50),
        },    
    }, {
        tableName: 'profit_loss_2nd_i18n',
        timestamps: false
    });

    // ProfitLoss2ndI18n.associate = function (models) {

    // };

    return ProfitLoss2ndI18n;
};
