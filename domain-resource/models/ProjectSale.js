"use strict";
module.exports = (sequelize, DataTypes) => {
    const ProjectSale = sequelize.define(
        "ProjectSale",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "project_sales_id",
            },
            projectId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "project_id",
            },
            expectedInspectionDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field:'expected_inspection'
            },
            expectedPaymentDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field:'expected_payment'
            },
            inspectionDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field:'inspection'
            },
            paymentDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                field:'payment'
            },
            expectedAmount: {
                type: DataTypes.DECIMAL(16,3),
                allowNull: false,
                field:'expected_amount'
            },
            amount: {
                type: DataTypes.DECIMAL(16,3),
                allowNull: false,
                field:'amount'
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "create_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "update_at",
            },
        },
        { tableName: "project_sales" }
    );
    /*ProjectCat.associate = function (models) {
        // associations can be defined here
    };*/
    return ProjectSale;
};
