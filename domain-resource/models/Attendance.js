"use strict";
module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define(
        "Attendance",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'attendance_id'
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                unique: true,
            },
            inTime: {
                type: DataTypes.TIME,
                allowNull: true,
                field: 'in_time'
            },
            outTime: {
                type: DataTypes.TIME,
                allowNull: true,
                field: 'out_time'
            },
            breakTime: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: 'break_time'
            },
            comp: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            employee: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
                field: 'employee_id'
            },
            reviewed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                field: 'reviewed'
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
            rmk: DataTypes.TEXT,
        },
        {
            tableName: "attendances",
            indexes: [
                {
                    unique: true,
                    fields: ["employee", "date"],
                },
            ],
        }
    );
    // eslint-disable-next-line no-unused-vars
    Attendance.associate = function (models) {
        // associations can be defined here
        Attendance.hasMany(models.WorkProject, {
            foreignKey: {
                name: "attendanceId",
            },
        });
    };
    return Attendance;
};
