"use strict";
module.exports = (sequelize, DataTypes) => {
    const AccountItem = sequelize.define(
        "AccountItem",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                //field: "accountItem_id",
            },
            code: DataTypes.STRING(6),
            name: DataTypes.STRING(20),
            type: DataTypes.INTEGER(1),
            dcType: {
                type: DataTypes.INTEGER(11),
                defaultValue: 0,
                allowNull: false,
                field: "dc_type",
            },
            catalog: {
                type: DataTypes.INTEGER(2),
                defaultValue: 0,
                allowNull: false,
            },
            catalogL0: {
                type: DataTypes.INTEGER(11),
                defaultValue: null,
                allowNull: true,
                field: "catalog_l0",
            },
            catalogL1: {
                type: DataTypes.INTEGER(11),
                defaultValue: null,
                allowNull: true,
                field: "catalog_l1",
            },
            catalogL2: {
                type: DataTypes.INTEGER(11),
                defaultValue: null,
                allowNull: true,
                field: "catalog_l2",
            },
            catalogL3: {
                type: DataTypes.INTEGER(11),
                defaultValue: null,
                allowNull: true,
                field: "catalog_l3",
            },
            status: DataTypes.INTEGER(1),
            rmk: {
                type: DataTypes.STRING(200),
                defaultValue: null,
                allowNull: true,
            },
            taxItemPrefix: {
                type: DataTypes.STRING(4),
                defaultValue: null,
                allowNull: true,
                field: "tax_item_prefix",
            },
            taxItemCode: {
                type: DataTypes.STRING(3),
                defaultValue: null,
                allowNull: true,
                field: "tax_item_code",
            },
        },
        { tableName: "accountitems", uniqueKeys: { uniCode: { fields: ["code"] } } }
    );
    AccountItem.associate = function (models) {
        AccountItem.hasMany(models.AccountItemI18n, { foreignKey: "accountItemId", sourceKey: "id" });
        AccountItem.hasMany(models.AccountItem, { as: "catalogL0Data", foreignKey: "catalogL0", sourceKey: "id" });
        AccountItem.hasMany(models.AccountItem, { as: "catalogL1Data", foreignKey: "catalogL1", sourceKey: "id" });
        AccountItem.hasMany(models.AccountItem, { as: "catalogL2Data", foreignKey: "catalogL2", sourceKey: "id" });
        AccountItem.hasMany(models.AccountItem, { as: "catalogL3Data", foreignKey: "catalogL3", sourceKey: "id" });
        AccountItem.belongsTo(AccountItem);
    };
    return AccountItem;
};
