/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const Form = sequelize.define('Form', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'form_id',
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        formTag: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'form_tag',
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
        tableName: 'form',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    Form.associate = function (models) {
        Form.hasMany(models.FormRoute, {
            foreignKey: {
                name: "formId",
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });

        Form.hasMany(models.FormDept, {
            foreignKey: {
                name: "formId",
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });

        Form.hasMany(models.FormRouteDept, {
            foreignKey: {
                name: "formId",
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });
    };

    return Form;
};
