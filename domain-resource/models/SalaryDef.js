"use strict";
module.exports = (sequelize, DataTypes) => {
    const SalaryDef = sequelize.define(
        "SalaryDef",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "salary_def_id",
            },
            employee: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            item: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            amount: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
            },
            rmk: {
                type: DataTypes.STRING(50),
                allowNull: false,
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
        { createdAt: "create_at", updatedAt: "update_at", tableName: "salary_defs" }
    );
    // SalaryDef.associate = function (models) {
    //     // associations can be defined here
    // };
    return SalaryDef;
};
