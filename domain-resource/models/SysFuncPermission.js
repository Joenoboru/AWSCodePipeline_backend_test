/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const SysFuncPermission = sequelize.define('SysFuncPermission', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'sys_func_permission_id',
        },
        sysId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'System',
                key: 'id'
            },
            field: 'sys_id',
        },
        permission: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: 'sys_func_permission',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    SysFuncPermission.associate = function (models) {
        SysFuncPermission.hasOne(models.System, { foreignKey: "id", sourceKey: "sysId" });
        SysFuncPermission.hasMany(models.SysFuncPermissionGroup, { foreignKey: "sysFuncPermissionId"});
        SysFuncPermission.belongsToMany(models.PermissionGroup, { through: models.SysFuncPermissionGroup, foreignKey: "sysFuncPermissionId" });
    };

    return SysFuncPermission;
};
