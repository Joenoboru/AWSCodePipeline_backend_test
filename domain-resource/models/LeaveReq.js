"use strict";
module.exports = (sequelize, DataTypes) => {
    const leaveReq = sequelize.define(
        "LeaveReq",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "leave_req_id",
            },
            startTime: {
                type: DataTypes.DATE,
                allowNull: false,
                field: "start_time",
            },
            endTime: {
                type: DataTypes.DATE,
                allowNull: false,
                field: "end_time",
            },
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "employee",
            },
            needhours:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            type: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reason: DataTypes.TEXT,
            status: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            rmk: DataTypes.TEXT,
            createAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "create_at",
            },
            updateAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "update_at",
            },
        },
        { tableName: "leave_reqs", createdAt: "createAt", updatedAt: "updateAt" }
    );
    leaveReq.associate = function (models) {
        // associations can be defined here
        leaveReq.belongsTo(models.Employee, {
            foreignKey: {
                name: "employeeId",
            },
        });
    };
    leaveReq.associate = function (models) {
        // associations can be defined here
        leaveReq.belongsTo(models.LeaveType, {
            foreignKey: {
                name: "type",
            },
        });
    };
    return leaveReq;
};
