"use strict";
module.exports = (sequelize, DataTypes) => {
    const WorkLevel = sequelize.define(
        "WorkLevel",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "worklevel_id",
            },
            name: {
                type: DataTypes.STRING(20),
                unique: true,
                allowNull: false,
            },
            status: DataTypes.INTEGER(1),
            cost: DataTypes.INTEGER(11),
            rmk: DataTypes.STRING,
            isHirer: {
                type: DataTypes.BOOLEAN(),
                field: "is_hirer",
            },
            createAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "create_at",
            },
            updateAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "update_at",
            },
        },
        { tableName: "worklevels", createdAt: "create_at", updatedAt: "update_at" }
    );
    WorkLevel.associate = function (models) {
        // associations can be defined here
        WorkLevel.hasMany(models.SalaryLv, {
            foreignKey: {
                name: "level",
            },
        });
    };
    return WorkLevel;
};
