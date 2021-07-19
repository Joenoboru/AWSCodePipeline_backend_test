/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const EmpPermissionGroup = sequelize.define('EmpPermissionGroup', {
        empId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'employee',
                key: 'id',
            },
            field: 'emp_id',
        },
        permissionGroupId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'PermissionGroup',
                key: 'id'
            },
            field: 'permission_group_id',
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
        tableName: 'emp_permission_group',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    EmpPermissionGroup.associate = function (models) {
        EmpPermissionGroup.belongsTo(models.PermissionGroup, {
            foreignKey: "permissionGroupId"
        });
        EmpPermissionGroup.belongsTo(models.Employee, {
            foreignKey: "empId"
        });
    };

    EmpPermissionGroup.removeAttribute('id');

    return EmpPermissionGroup;

};
