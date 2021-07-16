/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    const ProfitLoss2nd = sequelize.define(
        "ProfitLoss2nd",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "profit_loss_2nd_id",
            },
            profitLossMainId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "profit_loss_main_id",
            },
            code: {
                type: DataTypes.STRING(11),
                field: "accountitem_code",
            },
        },
        {
            tableName: "profit_loss_2nd",
            timestamps: false,
        }
    );

    ProfitLoss2nd.associate = function (models) {
        //ProfitLoss2nd.hasOne(models.ProfitLossMainI18n, { foreignKey: "id", sourceKey: "profitLossMainId" });
        ProfitLoss2nd.hasMany(models.ProfitLoss2ndI18n, { foreignKey: "profitLoss2ndId", sourceKey: "id" });
        ProfitLoss2nd.hasMany(models.ProfitLoss3rd, { foreignKey: "profitLoss2ndId", sourceKey: "id" });
    };

    return ProfitLoss2nd;
};
