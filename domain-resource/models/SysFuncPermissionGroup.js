/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const SysFuncPermissionGroup = sequelize.define('SysFuncPermissionGroup', {
        permissionGroupId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'PermissionGroup',
                key: 'id',
            },
            field: 'permission_group_id',
        },
        sysFuncPermissionId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'SysFuncPermission',
                key: 'id',
            },
            field: 'sys_func_permission_id',
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
        tableName: 'sys_func_permission_group',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    SysFuncPermissionGroup.associate = function (models) {
        // SysFuncPermissionGroup.belongsTo(models.PermissionGroup, { sourceKey: "permissionGroupId", foreignKey: "id" });
        SysFuncPermissionGroup.hasOne(models.SysFuncPermission, { sourceKey: "sysFuncPermissionId", foreignKey: "id" });
    };

    SysFuncPermissionGroup.removeAttribute('id');

    return SysFuncPermissionGroup;

};
