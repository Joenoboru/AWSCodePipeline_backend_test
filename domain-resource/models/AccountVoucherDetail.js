"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AccountVoucherDetail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            AccountVoucherDetail.belongsTo(models.AccountVoucher, { foreignKey: "voucherId" });
            AccountVoucherDetail.belongsTo(models.AccountItem, { foreignKey: "accItem" });
        }
    }
    AccountVoucherDetail.init(
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "account_voucher_detail_id",
            },
            voucherId: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: "voucher_id",
            },
            accItem: {
                allowNull: false,
                type: DataTypes.INTEGER,
                field: "acc_item",
            },
            accItemSub: {
                type: DataTypes.INTEGER,
                field: "acc_item_sub",
                allowNull: true,
                defaultValue: null,
            },
            debit: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                defaultValue: 0,
            },
            credit: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                defaultValue: 0,
            },
            rmk: {
                type: DataTypes.STRING(200),
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
        {
            sequelize,
            modelName: "AccountVoucherDetail",
            tableName: "account_voucher_detail",
        }
    );
    return AccountVoucherDetail;
};
