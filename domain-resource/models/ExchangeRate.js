'use strict';

module.exports = function (sequelize, DataTypes) {
    const ExchangeRate = sequelize.define('ExchangeRate', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'currency_id',

        },
        exrate: {
            type: DataTypes.DOUBLE(22,0).UNSIGNED,
            allowNull: false,
        },
    }, {
        tableName: 'exchange_rate',
        timestamps: false
    });

    ExchangeRate.associate = function (models) {
        //
    };

    return ExchangeRate;
};
