"use strict";
module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define(
        "Employee",
        {
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            engname: DataTypes.STRING(50),
            emp_num: {
                type: DataTypes.STRING(10),
                unique: true,
            },
            hire_date: DataTypes.DATEONLY,
            prob_start: DataTypes.DATEONLY,
            prob_end: DataTypes.DATEONLY,
            leave_date: DataTypes.DATEONLY,
            work_title: DataTypes.STRING(10),
            sex: DataTypes.INTEGER(1),
            birthday: DataTypes.DATEONLY,
            personID: DataTypes.STRING(20),
            bank_account: DataTypes.STRING(20),
            nationality: DataTypes.STRING(2),
            reg_addr: DataTypes.STRING(256),
            con_addr: DataTypes.STRING(256),
            tel: DataTypes.STRING(12),
            mobile: DataTypes.STRING(12),
            email: DataTypes.STRING(50),
            private_email: DataTypes.STRING(50),
            finaledu: DataTypes.STRING(50),
            gradschool: DataTypes.STRING(50),
            major: DataTypes.STRING(50),
            emer_name: DataTypes.STRING(50),
            emer_relat: DataTypes.STRING(50),
            emer_tel: DataTypes.STRING(12),
            rmk: DataTypes.TEXT,
            dependents: DataTypes.INTEGER(2),
            status: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
                defaultValue: 1,
            },
            workLevel: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
                defaultValue: 1,
                field: "work_level",
            },
        },
        {
            tableName: "employees"
        }
    );
    // Employee.findOneWithEmail = (email) => {
    //     return Employee.findOne({
    //         attributes: ["id"],
    //         where: {
    //             email: email,
    //             status:1 //在職的
    //         },
    //         raw: true,
    //     });
    // };
    Employee.findAndCountAllwithJoin = (models, options, depWhere, workposWhere) => {
        console.log(workposWhere);
        options.include = [
            {
                model: models.DepartPos,
                as: "main_departs",
                attributes: ["id"],
                include: [
                    { model: models.WorkPosition, attributes: ["id"], where: workposWhere },
                    {
                        model: models.Department,
                        attributes: ["id"],
                        where: depWhere,
                        //required: false,
                        include: {
                            model: models.Corporate,
                            attributes: ["id"],
                        },
                    },
                ],
                through: {
                    attributes: ["ord"],
                    where: {
                        ord: 1,
                        status: 1,
                    },
                },
            },
        ];
        return Employee.findAndCountAll(options);
    };
    Employee.findAllwithJoin = (models, options) => {
        options.include = [
            {
                model: models.Department,
                attributes: ["id", "name", "chname"],
            },
            {
                model: models.WorkPosition,
                attributes: ["id", "name", "chname"],
            },
        ];
        return Employee.findAndCountAll(options);
    };
    Employee.findOneWithJoin = (models, options) => {
        options.include = [
            {
                model: models.Department,
                attributes: ["id", "name", "chname"],
            },
            {
                model: models.WorkPosition,
                attributes: ["id", "name", "chname"],
            },
        ];
        return Employee.findOne(options);
    };
    Employee.associate = function (models) {
        // associations can be defined here
        Employee.belongsToMany(models.DepartPos, { through: models.EmpWork, foreignKey: "emp" });
        Employee.belongsToMany(models.DepartPos, {
            through: models.EmpWork,
            foreignKey: "emp",
            as: "main_departs",
        });
        Employee.belongsToMany(models.PermissionGroup, { through: models.EmpPermissionGroup, foreignKey: "empId" });
        Employee.belongsTo(models.WorkLevel, { foreignKey: "work_level" });
        Employee.hasOne(models.IntervieweeToEmployee, { foreignKey: "employeeId", sourceKey: "id" });
        Employee.hasOne(models.EmployeeMonthSalary, {
            foreignKey: "employeeId", sourceKey: "id"
        });
    };

    return Employee;
};
