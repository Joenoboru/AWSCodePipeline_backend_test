"use strict";
module.exports = (sequelize, DataTypes) => {
    const WorkProject = sequelize.define(
        "WorkProject",
        {

            attendanceId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: 'attendance_id',
                primaryKey: true,
            },
            project: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            detail: DataTypes.TEXT,
            usetime: DataTypes.FLOAT,
        },
        {
            tableName: "workprojects",
            indexes: [
                // {
                //     unique: true,
                //     fields: ["date", "employee", "project"],
                // },
            ],
        }
    );
    WorkProject.removeAttribute('id');
    WorkProject.associate = function (models) {
        WorkProject.belongsTo(models.Attendance, {
            foreignKey: {
                name: "attendanceId",
            },
        });
        WorkProject.belongsTo(models.Project, {
            foreignKey: {
                name: "project",
            },
        });
    };
    return WorkProject;
};
