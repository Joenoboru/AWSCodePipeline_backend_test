"use strict";

module.exports = (sequelize, DataTypes) => {
    const EmpWork = sequelize.define(
        "EmpWork",
        {
            emp: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            workpos: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ord: {
                type: DataTypes.INTEGER(3),
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
        },
        { tableName: "empworks" }
    );
    EmpWork.findWorkPositionByEmpId = (models, empId) => {
        return EmpWork.findAndCountAll({
            attributes: ["id", "ord"],
            where: { emp: empId },
            include: {
                model: models.DepartPos,
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
            },
            order: [
                ["ord", "ASC"],
                /*[models.DepartPos, models.Department, models.Corporate, 'name', 'ASC'],
            [models.DepartPos, models.Department, 'name', 'ASC'],
            [models.DepartPos, models.WorkPosition, 'name', 'ASC']*/
            ],
        });
    };
    EmpWork.findMasterByEmpId = (models, empId) => {
        return EmpWork.findOne({
            attributes: ["id"],
            where: { emp: empId },
            include: {
                model: models.DepartPos,
                attributes: ["id"],
                include: [
                    { model: models.WorkPosition, attributes: ["id"] },
                    {
                        model: models.Department,
                        attributes: ["id"],
                        include: {
                            model: models.Corporate,
                            attributes: ["id"],
                        },
                    },
                ],
            },
            order: [
                ["ord", "ASC"],
                /*[models.DepartPos, models.Department, models.Corporate, 'name', 'ASC'],
            [models.DepartPos, models.Department, 'name', 'ASC'],
            [models.DepartPos, models.WorkPosition, 'name', 'ASC']*/
            ],
        });
    };
    EmpWork.associate = function (models) {
        // associations can be defined here
        EmpWork.belongsTo(models.Employee, {
            foreignKey: {
                name: "emp",
            },
        });
        EmpWork.belongsTo(models.DepartPos, {
            foreignKey: {
                name: "workpos",
            },
        });
    };
    return EmpWork;
};
