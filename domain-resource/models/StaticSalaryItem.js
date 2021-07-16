"use strict";
module.exports = (sequelize, DataTypes) => {
    const StaticSalaryItem = sequelize.define(
        "StaticSalaryItem",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "static_salary_item_id",
            },
            name: {
                type: DataTypes.STRING(25),
                allowNull: false,
            },
            payment_type: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
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
        { tableName: "static_salary_items" }
    );
    
    return StaticSalaryItem;
};
