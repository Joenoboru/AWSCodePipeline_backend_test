"use strict";
module.exports = (sequelize, DataTypes) => {
    const RaDetails = sequelize.define(
        "RaDetails",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ra_details_id",
            },
            headerId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: "header_id",
            },
            transDate: {
                allowNull: false,
                type: DataTypes.DATEONLY,
                field: "trans_date",
            },
            invoice: {
                allowNull: true,
                type: DataTypes.STRING(10),
                defaultValue: null,
            },
            comment: {
                type: DataTypes.STRING(200),
            },
            amount: {
                type: DataTypes.DECIMAL(16, 3),
                defaultValue: 0.0,
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
        },
        { tableName: "ra_details" }
    );
    return RaDetails;
};
