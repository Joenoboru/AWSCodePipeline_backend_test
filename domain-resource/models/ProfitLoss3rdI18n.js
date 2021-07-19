/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const ProfitLoss3rdI18n = sequelize.define('ProfitLoss3rdI18n', {
        profitLoss3rdId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'profit_loss_3rd_id',
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
        tableName: 'profit_loss_3rd_i18n',
        timestamps: false
    });

    // ProfitLoss3rdI18n.associate = function (models) {

    // };

    return ProfitLoss3rdI18n;
};
