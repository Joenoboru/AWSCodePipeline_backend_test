/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const ActionType = sequelize.define('ActionType', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'action_type_id',
        },
        code: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'code',
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        tableName: 'action_type',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // ActionType.associate = function (models) {

    // };

    return ActionType;
};
