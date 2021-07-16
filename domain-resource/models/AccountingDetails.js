"use strict";
module.exports = (sequelize, DataTypes) => {
    const AccountingDetails = sequelize.define(
        "AccountingDetails",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'accounting_detail_id'
            },
            category: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'accounting_category'
            },
            inAccount: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'in_account'
            },
            outAccount: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'out_account'
            },
            amount: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                field: 'amount'
            },
            status: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                field: 'status'
            },
            invoice: {
                type: DataTypes.STRING(50),
                allowNull: true,
                field: 'invoice'
            },
            expectedPaymentDate: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                field: 'expected_payment_date'
            },
            paymentDate: {
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
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'employee_id'
            },
            customerId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'customer_id',
            },
            comment: DataTypes.TEXT,
            parentId: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'parent_id',
            },
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
            self: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
            },
            receipttype: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            receiptdate: {
                type: DataTypes.DATEONLY,
                allowNull: true,

            },
        },
        { tableName: "accounting_details" }
    );
    AccountingDetails.associate = function (models) {
        // associations can be defined here
        AccountingDetails.hasMany(models.AccountingDetailsSubRecords, { foreignKey: "accountingDetailId", sourceKey: "id" });
        AccountingDetails.hasOne(models.ProfitLossMainI18n, { foreignKey: "profitLossMainId", sourceKey: "pl1" });
        AccountingDetails.hasOne(models.ProfitLoss2ndI18n, { foreignKey: "profitLoss2ndId", sourceKey: "pl2" });
        AccountingDetails.hasOne(models.ProfitLoss3rd, { foreignKey: "id", sourceKey: "pl3" });
        AccountingDetails.hasOne(models.ProfitLoss3rdI18n, { foreignKey: "profitLoss3rdId", sourceKey: "pl3" });

    };
    return AccountingDetails;
};
