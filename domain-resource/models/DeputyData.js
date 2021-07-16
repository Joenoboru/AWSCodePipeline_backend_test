/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const DeputyData = sequelize.define('DeputyData', {
        empId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Employee',
                key: 'id',
            },
            field: 'emp_id',
        },
        deputyId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Employee',
                key: 'id'
            },
            field: 'deputy_id',
        },
        seqNo: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'seq_no',
        },
        type: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
        },
        startAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'start_at',
        },
        endAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_at',
        },
        status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
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
        tableName: 'deputy_data',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    DeputyData.associate = function (models) {
        DeputyData.belongsTo(models.Employee, {
            foreignKey: {
                name: "empId",
            },
        });
    };

    DeputyData.removeAttribute('id');

    return DeputyData;

};
