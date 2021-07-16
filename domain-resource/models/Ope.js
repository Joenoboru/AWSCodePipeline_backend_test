"use strict";
module.exports = (sequelize, DataTypes) => {
    const Ope = sequelize.define(
        "Ope",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ope_id",
            },
            no: {
                allowNull: false,
                unique: true,
                type: DataTypes.BIGINT(20),
                field: "ope_no",
            },
            transDate: {
                allowNull: false,
                type: DataTypes.DATEONLY,
                field: "trans_date",
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            empId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
                field: "employee_id",
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            rmk: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            accountId: {
                type: DataTypes.INTEGER(11),
                defaultValue: null,
                allowNull: true,
                field: "account_id",
            },
            attachment: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            converted: {
                type: DataTypes.INTEGER(1),
                defaultValue: 0,
            },
            repayDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                defaultValue: null,
                field: "repay_date",
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            createdUser: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "created_user",
            },
            updatedUser: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "updated_user",
            },
        },
        { tableName: "ope" }
    );
    Ope.associate = function (models) {
        // associations can be defined here
        Ope.hasMany(models.OpeDetail, {
            foreignKey: "headerId",
            onDelete: "cascade",
            onUpdate: "cascade",
        });
    };
    return Ope;
};
