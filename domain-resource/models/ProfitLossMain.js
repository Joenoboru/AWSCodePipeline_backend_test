/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const ProfitLossMain = sequelize.define('ProfitLossMain', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'profit_loss_main_id',
        },
    }, {
        tableName: 'profit_loss_main',
        timestamps: false
    });

    ProfitLossMain.associate = function (models) {
        ProfitLossMain.hasMany(models.ProfitLossMainI18n, { foreignKey: "profitLossMainId", sourceKey: "id" });
        ProfitLossMain.hasMany(models.ProfitLoss2nd, { foreignKey: "profitLossMainId", sourceKey: "id" });
    };

    return ProfitLossMain;
};
