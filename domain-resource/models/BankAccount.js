/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const BankAccount = sequelize.define('BankAccount', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'bank_account_id',
        },
        currencyId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'currency_id',
        },
        type: {
            type: DataTypes.INTEGER(2),
            defaultValue: 0,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(10),
            field: 'bank_code'
        },
        accountNumber: {
            type: DataTypes.STRING(30),
            field: 'account_number'
        },
        corporateId: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true,
            field: 'corporate_id',
        },
        rmk: {
            type: DataTypes.STRING(200),
            defaultValue: "",
            allowNull: true,
        },
        accItem: {
            type: DataTypes.INTEGER(11),
            defaultValue: null,
            allowNull: true,
            field: 'acc_item',
        },
        accItemSub: {
            type: DataTypes.STRING(10),
            defaultValue: null,
            allowNull: true,
            field: 'acc_item_sub',
        }
    }, {
        tableName: 'bank_account',
        timestamps: false
    });

    BankAccount.associate = function (models) {
        BankAccount.hasMany(models.BankAccountI18n, { foreignKey: "bankAccountId", sourceKey: "id" });
        BankAccount.hasMany(models.BankAccountState, { foreignKey: "bankAccountId", sourceKey: "id" });
    };

    return BankAccount;
};
