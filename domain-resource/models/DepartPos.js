"use strict";
module.exports = (sequelize, DataTypes) => {
    const DepartPos = sequelize.define(
        "DepartPos",
        {
            depart: DataTypes.INTEGER,
            workpos: DataTypes.INTEGER,
        },
        {
            tableName: "departpos",
            indexes: [
                {
                    unique: true,
                    fields: ["depart", "workpos"],
                },
            ],
        }
    );

    DepartPos.findAllWithDel = (models) => {
        return DepartPos.findAll({
            attributes: ["id"],
            include: [
                { model: models.WorkPosition, attributes: ["id", "name", "chname"] },
                {
                    model: models.Department,
                    attributes: ["id", "name", "chname"],
                    include: {
                        model: models.Corporate,
                        attributes: ["id", "name", "chname"],
                    },
                },
            ],
        });
    };

    DepartPos.findWorkPositionByDepId = (models, depId) => {
        return DepartPos.findAll({
            attributes: ["id", "workpos"],
            where: { depart: depId },
            include: {
                model: models.WorkPosition, attributes: ["id", "name", "chname"],

            },
            order: [['WorkPosition', 'ord', 'asc']]
        });
    };

    DepartPos.findDeptIdByEmpId = (empId) => {
        return DepartPos.findAll({
            attributes: ["depart"],
            include: {
                model: sequelize.models.EmpWork,
                attributes: ["workpos"],
                where: {
                    emp: empId,
                },
            },
        });
    };

    DepartPos.associate = function (models) {
        // associations can be defined here
        DepartPos.belongsToMany(models.Employee, { through: models.EmpWork, foreignKey: "workpos" });
        DepartPos.belongsTo(models.Department, {
            foreignKey: {
                name: "depart",
            },
        });
        DepartPos.hasMany(models.EmpWork, {
            foreignKey: {
                name: "workpos",
            },
        });
        DepartPos.belongsTo(models.WorkPosition, {
            foreignKey: {
                name: "workpos",
            },
        });
    };
    return DepartPos;
};
