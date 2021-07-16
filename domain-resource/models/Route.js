/* jshint indent: 2 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    const Route = sequelize.define('Route', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'route_id',
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        tableName: 'route',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    Route.associate = function (models) {
        Route.hasMany(models.RouteDetail, {
            foreignKey: {
                name: "routeId",
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });

        Route.hasMany(models.FormRoute, {
            foreignKey: {
                name: "routeId",
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });
    };

    return Route;
};
