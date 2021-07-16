/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const FormDept = sequelize.define('FormDept', {
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
        tableName: 'form_dept',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    FormDept.associate = function (models) {
        FormDept.belongsTo(models.Form, {
            foreignKey: {
                name: "formId",
            },
        });

        FormDept.belongsTo(models.Department, {
            foreignKey: {
                name: "deptId",
            },
        });
    };

    FormDept.removeAttribute('id');

    return FormDept;

};
