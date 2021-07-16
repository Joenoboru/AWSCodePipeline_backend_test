"use strict";
module.exports = (sequelize, DataTypes) => {
    const RaBody = sequelize.define(
        "RaBody",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ra_body_id",
            },
            headerId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: "header_id",
            },
            accItem: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "acc_item",
                defaultValue: null,
            },
            inAmount: {
                type: DataTypes.DECIMAL(16, 3),
                field: "in_amount",
            },
            outAmount: {
                type: DataTypes.DECIMAL(16, 3),
                field: "out_amount",
            },
            rmk: {
                type: DataTypes.STRING(200),
            },
            taxType: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: "tax_type",
            },
            mainRow: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                defaultValue: 0,
                field: "main_row",
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
        },
        { tableName: "ra_body" }
    );
    RaBody.associate = function (models) {
        RaBody.belongsTo(models.RaHeader, { foreignKey: "headerId" });
        RaBody.hasOne(models.RaItem, { foreignKey: "raItemId" });
        RaBody.belongsTo(models.AccountItem, { foreignKey: "accItem" });
    };
    return RaBody;
};
