"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AccountItemSetting extends Model {
        static associate(models) {
            // define association here
            this.AccountItem = this.hasOne(models.AccountItem, { foreignKey: "accItem" });
        }
    }
    AccountItemSetting.init(
        {
            tag: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
                field: "acc_tag",
            },
            accItem: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "acc_item",
            },
            conds: {
                allowNull: true,
                type: DataTypes.JSON,
            },
            rmk: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedUser: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "updated_user",
            },
        },
        {
            sequelize,
            modelName: "AccountItemSetting",
            tableName: "accountitems_setting",
        }
    );
    return AccountItemSetting;
};
