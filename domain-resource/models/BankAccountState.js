/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const BankAccountState = sequelize.define('BankAccountState', {
        settleDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            primaryKey: true,
            field: 'settle_date',

        },
        bankAccountId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'bank_account_id',
        },
        amount: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
        manual: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'manual',
        },
        createdUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: "created_user",
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "created_at",
        },
        updatedUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: "updated_user",
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "updated_at",
        },
    }, {
        tableName: 'bank_account_state',
    });
    BankAccountState.removeAttribute('id');
    // BankAccountState.associate = function (models) {
    //     // BankAccount.hasOne(models.ProfitLoss2ndI18n, { foreignKey: "profitLoss2ndId", sourceKey: "id" });
    //     // BankAccount.hasMany(models.ProfitLoss3rd, { foreignKey: "profitLoss2ndId", sourceKey: "id" });

    // };

    return BankAccountState;
};
