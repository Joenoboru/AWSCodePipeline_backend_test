/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const BankAccountI18n = sequelize.define('BankAccountI18n', {
        bankAccountId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'bank_account_id',
        }, 
        languageId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'language_id',
        },  
        name: {
            type: DataTypes.STRING(50),
        },    
    }, {
        tableName: 'bank_account_i18n',
        timestamps: false
    });
    BankAccountI18n.removeAttribute('id');
    // BankAccountI18n.associate = function (models) {

    // };

    return BankAccountI18n;
};
