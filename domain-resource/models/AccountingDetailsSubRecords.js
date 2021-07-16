"use strict";
module.exports = (sequelize, DataTypes) => {
    const AccountingDetailsSubRecords = sequelize.define(
        "AccountingDetailsSubRecords",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'accounting_details_sub_record_id'
            },
            accountingDetailId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: 'accounting_detail_id'
            },
            amount: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                field: 'amount'
            },
            invoice: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'invoice'
            },
            expectedPaymentDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'payment_date'
            },
            pl1: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'profit_loss_main_id',
            },
            pl2: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'profit_loss_2nd_id',
            },
            pl3: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'profit_loss_3rd_id',
            },

            comment: DataTypes.TEXT,
            createdUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'created_user',
            },
            updatedUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'updated_user',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'updated_at',
            },

        },
        { tableName: "accounting_details_sub_records" }
    );
    // AccountingDetails.associate = function (models) {
    //     // associations can be defined here
    //     // AccountingDetails.hasOne(models.BankAccount, { foreignKey: "bankAccountId", sourceKey: "id" });
    // };
    return AccountingDetailsSubRecords;
};
