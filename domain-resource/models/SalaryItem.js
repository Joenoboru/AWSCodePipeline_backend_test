"use strict";
module.exports = (sequelize, DataTypes) => {
    const SalaryItem = sequelize.define(
        "SalaryItem",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "salary_item_id",
            },
            name: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            chname: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            order: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            payment_type: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            wl_only: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            default_amount: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
            },
            tax_type: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            perday_use: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
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
        { createdAt: "create_at", updatedAt: "update_at", tableName: "salary_items" }
    );
    SalaryItem.associate = function (models) {
        SalaryItem.hasMany(models.SalaryLv, {
            foreignKey: {
                name: "item",
            },
        });
        // associations can be defined here
    };
    return SalaryItem;
};
