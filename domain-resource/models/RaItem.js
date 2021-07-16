"use strict";
module.exports = (sequelize, DataTypes) => {
    const RaItem = sequelize.define(
        "RaItem",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ra_item_id",
            },
            type: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            catalog: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            accItem: {
                type: DataTypes.STRING(10),
                allowNull: false,
                field: "acc_item",
                defaultValue: null,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "created_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "updated_at",
            },
        },
        { tableName: "ra_item" }
    );
    RaItem.associate = function (models) {
        RaItem.hasMany(models.RaItemI18n, { foreignKey: "raItemId", sourceKey: "id" });
    };
    return RaItem;
};
