/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const CompanyRule = sequelize.define('CompanyRule', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'company_rule_id',
        },
        timezone: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        offday: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        holiday: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        workOn: {
            type: DataTypes.TIME,
            allowNull: true,
            field: 'work_on'
        },
        workOff: {
            type: DataTypes.TIME,
            allowNull: true,
            field: 'work_off'
        },
        breakStart: {
            type: DataTypes.TIME,
            allowNull: true,
            field: 'break_start'
        },
        breakEnd: {
            type: DataTypes.TIME,
            allowNull: true,
            field: 'break_end'
        },
        ope: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        mainCurrency: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'main_currency'
        },
        extraLimitMinutes: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'extra_limit_minutes'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "created_at",
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: "updated_at",
        },
    }, {
        tableName: 'company_rule',
    });
    // CompanyRule.associate = function (models) {

    // };

    return CompanyRule;
};
