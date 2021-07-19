"use strict";
module.exports = (sequelize, DataTypes) => {
    const AccountingBatchMain = sequelize.define(
        "AccountingBatchMain",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            filename: {
                type: DataTypes.STRING(200),
            },
            createdUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: 'created_user',
            },
        },
        { tableName: "accounting_batch_mains" }
    );
    AccountingBatchMain.associate = function (models) {
        // associations can be defined here


    };
    return AccountingBatchMain;
};
