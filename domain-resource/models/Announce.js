/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const Announce = sequelize.define('Announce', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'announce_id',
        },
        onTop: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'on_top',
        },
        show: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'show',
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'title',
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content',
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
        tableName: 'announce',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // Announce.associate = function (models) {

    // };

    return Announce;
};
