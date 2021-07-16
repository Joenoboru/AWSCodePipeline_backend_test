"use strict";
module.exports = (sequelize, DataTypes) => {
    const AccountingBatchMainDetail = sequelize.define(
        "AccountingBatchMainDetail",
        {
            accountingId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: 'accounting_id'
            },
            mainId: {
                primaryKey: true,
                type: DataTypes.INTEGER,
                field:'main_id'
            },
        },
        { tableName: "accounting_batch_main_details" }
    );
    AccountingBatchMainDetail.associate = function (models) {
        // associations can be defined here


    };
    return AccountingBatchMainDetail;
};
