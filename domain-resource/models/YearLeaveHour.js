/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const YearLeaveHour = sequelize.define('YearLeaveHour', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'employee_vacation_hour_id',
        },
        employeeId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'employee_id',
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'start_date',
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'end_date',
        },
        hours: {
            type: DataTypes.JSON,
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
        tableName: 'year_leave_hour',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    YearLeaveHour.associate = function (models) {
        
        YearLeaveHour.hasMany(models.YearLeaveHourRecord, {
            foreignKey: {
                name: "yearLeaveHourId",
            },
        });
    };

    return YearLeaveHour;
};
