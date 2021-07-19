/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const ProfitLossMainI18n = sequelize.define('ProfitLossMainI18n', {
        profitLossMainId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'profit_loss_main_id',
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
        tableName: 'profit_loss_main_18n',
        timestamps: false
    });

    // ProfitLossMainI18n.associate = function (models) {

    // };

    return ProfitLossMainI18n;
};
