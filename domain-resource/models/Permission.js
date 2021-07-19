/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'permission_id',
        },
        number: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        name: {
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
        tableName: 'permission',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // Permission.associate = function (models) {

    // };

    return Permission;
};
