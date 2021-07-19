/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    const YearLeaveHourExtraRecord = sequelize.define(
        "YearLeaveHourExtraRecord",
        {
            yearLeaveHourId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "year_leave_hour_id",
            },
            extrahoursreqId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: "extrahoursreq_id",
                primaryKey: true,
            },
            hours: {
                type: DataTypes.FLOAT(11),
                allowNull: false,
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
            tableName: "year_leave_hour_extra_record",
        }
    );
    YearLeaveHourExtraRecord.removeAttribute("id");
    // YearLeaveHourExtraRecord.associate = function (models) {};

    return YearLeaveHourExtraRecord;
};
