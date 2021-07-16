/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const System = sequelize.define('System', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'sys_id',
        },
        sysCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'sys_code',
        },
        subSysCode: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'sub_sys_code',
        },
        funcCode: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'func_code',
        },
        sysName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'sys_name',
        },
        subSysName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'sub_sys_name',
        },
        funcName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'func_name',
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
        },
        createUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'create_user',
        },
        createAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'create_at',
        },
        updateUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'update_user',
        },
        updateAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'update_at',
        },
    }, {
        tableName: 'system',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // System.associate = function (models) {

    // };

    return System;
};
