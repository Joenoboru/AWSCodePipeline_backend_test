/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const PermissionGroup = sequelize.define('PermissionGroup', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'permission_group_id',
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
        tag: {
            type: DataTypes.STRING(50),
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
        tableName: 'permission_group',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    PermissionGroup.associate = function (models) {
        PermissionGroup.belongsToMany(models.Employee, { through: models.EmpPermissionGroup, foreignKey: "permissionGroupId" });
        PermissionGroup.hasMany(models.SysFuncPermissionGroup, { foreignKey: "permissionGroupId" })
        PermissionGroup.belongsToMany(models.SysFuncPermission, { through: models.SysFuncPermissionGroup, foreignKey: "permissionGroupId" });
    };

    return PermissionGroup;
};
