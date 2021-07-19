"use strict";
module.exports = (sequelize, DataTypes) => {
    const RaTransfer = sequelize.define(
        "RaTransfer",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "ra_transfer_id",
            },
            no: {
                allowNull: false,
                unique: true,
                type: DataTypes.BIGINT(20),
                field: "ra_trans_no",
            },
            date: {
                allowNull: false,
                type: DataTypes.DATEONLY,
                field: "transfer_date",
            },
            amount: {
                type: DataTypes.DECIMAL(16, 3),
                defaultValue: 0.0,
            },
            inAccount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "in_account",
            },
            outAccount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "out_account",
            },
            fee: {
                type: DataTypes.DECIMAL(16, 3),
                defaultValue: 0.0,
            },
            feeTarget: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
                defaultValue: 0,
                field: "fee_target",
            },
            status: {
                type: DataTypes.INTEGER(1),
                allowNull: false,
            },
            rmk: {
                type: DataTypes.TEXT,
            },
            attachment: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            converted: {
                type: DataTypes.INTEGER(1),
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                //field: "created_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                //field: "updated_at",
            },
            createdUser: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "created_user",
            },
            updatedUser: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "updated_user",
            },
        },
        { tableName: "ra_transfer" }
    );
    return RaTransfer;
};
