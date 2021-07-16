/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const FormRouteDept = sequelize.define('FormRouteDept', {
        formId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Form',
                key: 'id',
            },
            field: 'form_id',
        },
        routeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Route',
                key: 'id',
            },
            field: 'route_id',
        },
        deptId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'department',
                key: 'id'
            },
            field: 'dept_id',
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
        tableName: 'form_route_dept',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    FormRouteDept.associate = function (models) {
        FormRouteDept.belongsTo(models.Form, {
            foreignKey: {
                name: "formId",
            },
        });

        FormRouteDept.belongsTo(models.Route, {
            foreignKey: {
                name: "routeId",
            },
        });

        FormRouteDept.belongsTo(models.Department, {
            foreignKey: {
                name: "deptId",
            },
        });
    };

    FormRouteDept.removeAttribute('id');

    return FormRouteDept;

};
