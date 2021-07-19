/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const RouteDetail = sequelize.define('RouteDetail', {
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
        stageNo: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            primaryKey: true,
            field: 'stage_no',
        },
        auditType: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            field: 'audit_type',
        },
        deptId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'dept_id',
        },
        gradeId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'grade_id',
        },
        auditorId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            references: {
                model: 'Employee',
                key: 'id',
            },
            field: 'auditor_id',
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
        tableName: 'route_detail',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    RouteDetail.associate = function (models) {
        RouteDetail.belongsTo(models.Route, {
            foreignKey: {
                name: "routeId",
            },
        });
        RouteDetail.hasMany(models.FormSectionRouteDetail, {
            foreignKey: {
                name: "routeId",
            },
        })
    };

    RouteDetail.removeAttribute('id');

    return RouteDetail;

};
