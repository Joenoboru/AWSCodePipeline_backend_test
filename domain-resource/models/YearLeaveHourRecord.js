/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const YearLeaveHourRecord = sequelize.define('YearLeaveHourRecord', {
        yearLeaveHourId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'year_leave_hour_id',
        },
        type: {
            type: DataTypes.STRING(255),
            allowNull: false,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'employee_id',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'created_at',
        },

        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at',
        },
    }, {
        tableName: 'year_leave_hour_record',
    });

    YearLeaveHourRecord.removeAttribute('id');
    // YearLeaveHourRecord.associate = function (models) {
    // };

    return YearLeaveHourRecord;
};
