"use strict";
module.exports = (sequelize, DataTypes) => {
    const OpeDetail = sequelize.define(
        "OpeDetail",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ope_detail_id",
            },
            headerId: {
                //allowNull: false,
                type: DataTypes.INTEGER(11),
                field: "header_id",
            },
            accItem: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "acc_item",
                defaultValue: null,
            },
            receiptType: {
                allowNull: true,
                type: DataTypes.STRING(10),
                defaultValue: null,
                field: "receipt_type",
            },
            invoice: {
                allowNull: true,
                type: DataTypes.STRING(10),
                defaultValue: null,
            },
            taxType: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: "tax_type",
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
        { tableName: "ope_details" }
    );
    OpeDetail.associate = function (models) {
        // associations can be defined here
        OpeDetail.belongsTo(models.Ope, { foreignKey: "headerId" });
    };
    return OpeDetail;
};
