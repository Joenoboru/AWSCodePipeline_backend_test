"use strict";
module.exports = (sequelize, DataTypes) => {
    const RaType = sequelize.define(
        "RaType",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ra_type_id",
            },
            type: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            accItem: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "acc_item",
            },
            rmk: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        { tableName: "ra_type" }
    );
    RaType.associate = function (models) {
        RaType.hasMany(models.RaTypeI18n, { foreignKey: "raTypeId", sourceKey: "id" });
    };
    return RaType;
};
