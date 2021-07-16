"use strict";
module.exports = (sequelize, DataTypes) => {
    const AccountingDetailImportMethod = sequelize.define(
        "AccountingDetailImportMethod",
        {
            name: {
                type: DataTypes.STRING(10),
                field: "name",
            },
            code: {
                type: DataTypes.STRING(50),
                field: "code",
                primaryKey: true,
            },
        },
        {
            tableName: "accounting_detail_import_method",
            timestamps: false,
        }
    );
    AccountingDetailImportMethod.removeAttribute('id');
    return AccountingDetailImportMethod;
};
