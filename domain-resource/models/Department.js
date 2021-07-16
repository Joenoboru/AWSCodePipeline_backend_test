"use strict";
module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define(
        "Department",
        {
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            chname: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            corp: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            orgp: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            rmk: DataTypes.STRING(200),
        },
        {
            tableName: "departments",
            indexes: [
                {
                    unique: true,
                    fields: ["corp", "name"],
                },
                {
                    unique: true,
                    fields: ["corp", "chname"],
                }
            ],
        }
    );
    Department.associate = function (models) {
        // associations can be defined here
        Department.belongsTo(models.Corporate, {
            foreignKey: {
                name: "corp",
            },
        });
    };
    return Department;
};
