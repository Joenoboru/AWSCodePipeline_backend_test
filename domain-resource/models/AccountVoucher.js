"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AccountVoucher extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            AccountVoucher.hasMany(models.AccountVoucherDetail, { foreignKey: "voucherId", sourceKey: "id" });
        }
    }
    AccountVoucher.init(
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "account_voucher_id",
            },
            no: {
                allowNull: false,
                unique: true,
                type: DataTypes.BIGINT,
                field: "account_voucher_no",
            },
            date: {
                allowNull: false,
                type: DataTypes.DATEONLY,
            },
            source: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            sourceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            type: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            totalDebit: {
                type: DataTypes.DECIMAL(16, 3),
                field: "total_debit",
                allowNull: false,
            },
            totalCredit: {
                type: DataTypes.DECIMAL(16, 3),
                field: "total_credit",
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            rmk: {
                type: DataTypes.STRING(200),
            },
        },
        {
            sequelize,
            modelName: "AccountVoucher",
            tableName: "account_voucher",
        }
    );
    return AccountVoucher;
};
