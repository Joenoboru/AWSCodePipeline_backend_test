"use strict";

module.exports = function (sequelize, DataTypes) {
    const BusinessTrip = sequelize.define(
        "BusinessTrip",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "business_trip_id",
            },
            employeeId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "employee_id",
            },
            title: {
                type: DataTypes.STRING(50),
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
            reason: DataTypes.TEXT,
            projectId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "project_id",
            },
            attachFiles: {
                type: DataTypes.TEXT,
                allowNull: true,
                field: "attach_files",
                get: function () {
                    const dataValue = this.getDataValue("attachFiles");
                    if (typeof dataValue === "object") {
                        return dataValue;
                    }
                    if (typeof dataValue === "string") {
                        return JSON.parse(dataValue);
                    }
                    return null;
                },
                set: function (value) {
                    if (typeof value === "object") {
                        this.setDataValue("attachFiles", JSON.stringify(value));
                    }
                    if (typeof value === "string") {
                        this.setDataValue("attachFiles", value);
                    }
                },
            },
            outAccount: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "out_account",
            },
            status: {
                type: DataTypes.INTEGER(11),
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "created_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "updated_at",
            },
        },
        {
            tableName: "business_trip",
            timestamps: false,
        }
    );

    BusinessTrip.associate = function (models) {
        BusinessTrip.hasMany(models.BusinessTripCostDetail, { foreignKey: "businessTripId", sourceKey: "id" });
    };

    return BusinessTrip;
};
