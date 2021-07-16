/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    const LeaveType = sequelize.define(
        "LeaveType",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "leave_type_id",
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            explain: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            // daysLimit: {
            //     type: DataTypes.INTEGER(3),
            //     allowNull: false,
            //     field: "days_limit",
            // },
            exchange: {
                type: DataTypes.BOOLEAN,
            },
            repetitions: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            // repetition: {
            //     type: DataTypes.JSON,
            //     allowNull: true,
            // },
            // seniorityCond: {
            //     type: DataTypes.JSON,
            //     allowNull: true,
            //     field: "seniority_cond",

            // },
            // seniorityAddition: {
            //     type: DataTypes.JSON,
            //     allowNull: true,
            //     field: "seniority_addition",
            // },
            // posCond: {
            //     type: DataTypes.JSON,
            //     allowNull: true,
            //     field: "pos_cond",
            // },
            discount: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: "discount",
            },
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
        {
            tableName: "leave_type",
            createdAt: "createAt",
            updatedAt: "updateAt",
        }
    );

    // LeaveType.associate = function (models) {};

    return LeaveType;
};
