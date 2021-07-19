"use strict";
module.exports = (sequelize, DataTypes) => {
    const BudgetDetails = sequelize.define(
        "BudgetDetails",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'budget_detail_id'
            },
            yearMonth: {
                type: DataTypes.STRING(10),
                allowNull: true,
                field: 'year_month'
            },
            pl1: {
                type: DataTypes.INTEGER(11),
                allowNull: true,

            },
            pl2: {
                type: DataTypes.INTEGER(11),
                allowNull: true,

            },
            pl3: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            currency: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
            },
            amount: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                field: 'amount'
            },
            comment: DataTypes.TEXT,

            createdUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'created_user',
            },
            updatedUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'updated_user',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'updated_at',
            },

        },
        { tableName: "budget_details" }
    );
    BudgetDetails.associate = function (models) {


    };
    return BudgetDetails;
};
