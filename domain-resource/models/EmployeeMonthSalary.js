"use strict";
module.exports = (sequelize, DataTypes) => {
    const EmployeeMonthSalary = sequelize.define(
        "EmployeeMonthSalary",
        {
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: "employee_id",
            },
            yearMonth: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                field: "year_month",
            },
            totalAmountEmp: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "total_amount_emp",
            },
            totalAmountCompany: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "total_amount_company",
            },
            detail: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            logic: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            totalHours: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: "total_hours",
            },
            originTotalExtraHours: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: "origin_total_extra_hours",
            },
            totalExtraHours: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: "total_extra_hours",
            },
            totalAbsenceHours: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: "total_absence_hours",
            },
            totalLeaveHours: {
                type: DataTypes.FLOAT,
                allowNull: true,
                field: "total_leave_hours",
            },
            employeeWorkDatas: {
                type: DataTypes.JSON,
                allowNull: true,
                field: "employee_work_datas",
            },
            insurance: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "insurance",
            },
            insuranceDetail: {
                type: DataTypes.JSON,
                allowNull: true,
                field: "insurance_detail",
            },
            taxPaidAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "tax_paid_amount",
            },
            mustPay: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "must_pay",
            },
            mustDeduct: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "must_deduct",
            },
            hoursAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: "hours_amount",
            },
            status: {
                type: DataTypes.INTEGER,
                field: "status",
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
        { createdAt: "create_at", updatedAt: "update_at", tableName: "employee_month_salary" }
    );
    EmployeeMonthSalary.associate = function (models) {
        EmployeeMonthSalary.belongsTo(models.Employee, {
            foreignKey: "employeeId",
        });

        // associations can be defined here
    };
    return EmployeeMonthSalary;
};
