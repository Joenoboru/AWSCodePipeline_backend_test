"use strict";
module.exports = (sequelize, DataTypes) => {
    const SalaryLv = sequelize.define(
        "SalaryLv",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "salarylv_id",
            },
            level: DataTypes.INTEGER,
            item: DataTypes.INTEGER,
            amount: DataTypes.INTEGER,
            rmk: DataTypes.STRING(50),
            createUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: "create_user",
            },
            createAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "create_at",
            },
            updateUser: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
                field: "update_user",
            },
            updateAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "update_at",
            },
        },
        {
            tableName: "salarylvs",
            createdAt: "create_at", updatedAt: "update_at", uniqueKeys: { uniItemSLv: { fields: ["item", "level"] } }
        }
    );

    SalaryLv.findBySalaryItem = (models, siId) => {
        return SalaryLv.findAndCountAll({
            attributes: ["id", "level", "amount", "rmk"],
            where: { item: siId },
            order: [[models.WorkLevel, "name", "asc"]],
            include: { model: models.WorkLevel, attributes: ["id", "name"], where: { status: 1 } },
        });
    };

    SalaryLv.associate = function (models) {
        // associations can be defined here
        SalaryLv.belongsTo(models.SalaryItem, {
            foreignKey: {
                name: "item",
            },
        });
        SalaryLv.belongsTo(models.WorkLevel, {
            foreignKey: {
                name: "level",
            },
        });
    };
    return SalaryLv;
};
