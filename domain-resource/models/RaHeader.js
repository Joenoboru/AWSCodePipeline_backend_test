"use strict";
module.exports = (sequelize, DataTypes) => {
    const RaHeader = sequelize.define(
        "RaHeader",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ra_header_id",
            },
            no: {
                allowNull: false,
                unique: true,
                type: DataTypes.BIGINT,
                field: "ra_header_no",
            },
            transDate: {
                allowNull: false,
                type: DataTypes.DATEONLY,
                field: "trans_date",
            },
            payDate: {
                allowNull: false,
                type: DataTypes.DATEONLY,
                field: "pay_date",
            },
            type: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            catalog: {
                type: DataTypes.INTEGER(11),
                //allowNull: false,
            },
            inAmount: {
                type: DataTypes.DECIMAL(16, 3),
                field: "in_amount",
            },
            outAmount: {
                type: DataTypes.DECIMAL(16, 3),
                field: "out_amount",
            },
            taxRate: {
                type: DataTypes.DECIMAL(5, 3),
                field: "tax_rate",
            },
            invoice: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            payType: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: "pay_type",
            },
            accountId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "account_id",
            },
            customerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
                field: "customer_id",
            },
            parentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
                field: "parent_id",
            },
            empId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: null,
                field: "employee_id",
            },
            rmk: {
                type: DataTypes.TEXT,
            },
            source: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            sourceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            attachment: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            converted: {
                type: DataTypes.INTEGER(1),
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                //field: "created_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                //field: "updated_at",
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
        { tableName: "ra_header" }
    );
    RaHeader.associate = function (models) {
        RaHeader.hasMany(models.RaBody, { foreignKey: "headerId", sourceKey: "id" });
        RaHeader.hasMany(models.RaDetails, { foreignKey: "headerId", sourceKey: "id" });
        RaHeader.hasOne(models.RaType, { foreignKey: "catalog" });
    };
    return RaHeader;
};
