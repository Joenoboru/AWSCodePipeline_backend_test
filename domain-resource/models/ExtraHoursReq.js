"use strict";
module.exports = (sequelize, DataTypes) => {
    const ExtraHoursReq = sequelize.define(
        "ExtraHoursReq",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "id",
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                primaryKey: true,
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: "start_time",
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
                field: "end_time",
            },
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "employee",
                primaryKey: true,
            },
            hours: {
                type: DataTypes.FLOAT(11),
                allowNull: true,
            },
            type: {
                type: DataTypes.INTEGER(1),
                allowNull: true,
            },
            reason: DataTypes.TEXT,
            comp: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            rmk: DataTypes.TEXT,
            status: {
                type: DataTypes.INTEGER(2),
                allowNull: true,
            },
        },
        {
            tableName: "extrahoursreqs"
        }
    );
    // ExtraHoursReq.associate = function (models) {
    //     // associations can be defined here
    // };
    return ExtraHoursReq;
};
