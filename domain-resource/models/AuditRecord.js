/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const AuditRecord = sequelize.define('AuditRecord', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'audit_record_id',
        },
        formId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Form',
                key: 'id',
            },
            field: 'form_id',
        },
        routeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Route',
                key: 'id',
            },
            field: 'route_id',
        },
        formTag: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'form_tag',
        },
        status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
        },
        actionType: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            field: 'action_type',
        },
        viewed: {
            type: DataTypes.BOOLEAN,
        },
        auditData: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'audit_data',
            get: function () {
                const dataValue = this.getDataValue('auditData');
                if(typeof dataValue === "object"){
                    return dataValue;
                }
                if(typeof dataValue === "string"){
                    return JSON.parse(dataValue);
                }
                return null;
            },
            set: function (value) {
                this.setDataValue('auditData', JSON.stringify(value));
            },
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
        tableName: 'audit_record',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    AuditRecord.associate = function (models) {
        AuditRecord.hasMany(models.AuditRecordDetail, {
            foreignKey: {
                name: 'auditRecordId',
            },
            as: 'lastAuditor',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });

        AuditRecord.hasMany(models.AuditRecordDetail, {
            foreignKey: {
                name: 'auditRecordId',
            },
            as: 'arDetail',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        });

    };

    return AuditRecord;

};
