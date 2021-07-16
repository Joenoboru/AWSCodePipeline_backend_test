/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const FormRoute = sequelize.define('FormRoute', {
        formId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Form',
                key: 'id',
            },
            field: 'form_id',
        },
        routeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Route',
                key: 'id',
            },
            field: 'route_id',
        },
        name: {
            type: DataTypes.STRING(255),
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
        tableName: 'form_route',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    FormRoute.associate = function (models) {
        FormRoute.hasOne(models.Route, { foreignKey: "id", sourceKey: "routeId" });
    };

    FormRoute.removeAttribute('id');

    return FormRoute;

};
