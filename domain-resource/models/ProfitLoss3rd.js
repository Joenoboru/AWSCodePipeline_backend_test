/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const ProfitLoss3rd = sequelize.define('ProfitLoss3rd', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'profit_loss_3rd_id',

        },
        profitLoss2ndId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'profit_loss_2nd_id',
        },
        code: {
            type: DataTypes.STRING(11),
            field: 'accountitem_code'
        }
    }, {
        tableName: 'profit_loss_3rd',
        timestamps: false
    });

    ProfitLoss3rd.associate = function (models) {
        ProfitLoss3rd.hasMany(models.ProfitLoss3rdI18n, { foreignKey: "profitLoss3rdId", sourceKey: "id" });
        ProfitLoss3rd.hasOne(models.AccountItem, { foreignKey: "code", sourceKey: "code" });
        ProfitLoss3rd.hasOne(models.ProfitLoss2nd, { foreignKey: "id", sourceKey: "profitLoss2ndId" });
    };

    return ProfitLoss3rd;
};
