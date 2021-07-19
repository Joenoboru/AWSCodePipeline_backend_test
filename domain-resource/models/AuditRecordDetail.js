/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    const AuditRecordDetail = sequelize.define(
        "AuditRecordDetail",
        {
            auditRecordId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                references: {
                    model: "AuditRecord",
                    key: "id",
                },
                field: "audit_record_id",
            },
            stageNo: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                field: "stage_no",
            },
            seqNo: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "seq_no",
            },
            routeId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                references: {
                    model: "RouteDetail",
                    key: "routeId",
                },
                field: "route_id",
            },
            auditorId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                references: {
                    model: "Employee",
                    key: "id",
                },
                field: "auditor_id",
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                defaultValue: "0",
            },
            remark: {
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            auditData: {
                type: DataTypes.TEXT,
                allowNull: true,
                get: function () {
                    const dataValue = this.getDataValue("auditData");
                    if (typeof dataValue === "object") {
                        return dataValue;
                    }
                    if (typeof dataValue === "string") {
                        return JSON.parse(dataValue);
                    }
                    return null;
                },
                set: function (value) {
                    this.setDataValue("auditData", JSON.stringify(value));
                },
                field: "audit_data",
            },
            deputyId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                references: {
                    model: "Employee",
                    key: "id",
                },
                field: "deputy_id",
            },
            createUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: "create_user",
            },
            createAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "create_at",
            },
            updateUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: "update_user",
            },
            updateAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "update_at",
            },
        },
        {
            tableName: "audit_record_detail",
            createdAt: "createAt",
            updatedAt: "updateAt",
        }
    );

    // associations
    AuditRecordDetail.associate = function (models) {
        AuditRecordDetail.belongsTo(models.AuditRecord, {
            targetKey: "id",
            foreignKey: "auditRecordId",
        });
    };

    AuditRecordDetail.removeAttribute("id");

    return AuditRecordDetail;
};
