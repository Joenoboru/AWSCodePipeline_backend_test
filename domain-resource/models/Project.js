"use strict";
module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define(
        "Project",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "project_id",
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            customer: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            orderYear: {
                type: DataTypes.INTEGER(4),
                field: "order_year",
            },
            orderMonth: {
                type: DataTypes.INTEGER(2),
                field: "order_month",
            },
            cat: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            incharge: DataTypes.INTEGER,
            devStart: {
                type: DataTypes.DATEONLY,
                field: "dev_start",
            },
            devEnd: {
                type: DataTypes.DATEONLY,
                field: "dev_end",
            },
            detail: DataTypes.TEXT,
            rmk: DataTypes.TEXT,
            budget: DataTypes.BIGINT(12),
            costEst: {
                type: DataTypes.BIGINT(12),
                field: "cost_est",
            },
            costCalc: {
                type: DataTypes.BIGINT(12),
                field: "cost_calc",
            },
            costRateEst: {
                type: DataTypes.DECIMAL(8, 6),
                field: "cost_rate_calc",
            },
            costRateCalc: {
                type: DataTypes.DECIMAL(8, 6),
                field: "cost_rate_est",
            },
            usedRate: {
                type: DataTypes.DECIMAL(8, 6),
                field: "used_rate",
            },
            status: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            expectedDate: {
                type: DataTypes.DATEONLY,
                field: "expected_date",
            },
            selectable: DataTypes.BOOLEAN,
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
        {
            tableName: "projects",
            createdAt: "create_at",
            updatedAt: "update_at",
        }
    );

    Project.findAndCountAllwithJoin = (models, options) => {
        options.nested = false;
        options.include = [
            {
                model: models.Corporate,
                attributes: ["id", ["name", "customer_name"], ["chname", "customer_chname"]],
            },
        ];
        return Project.findAll(options);
    };

    Project.associate = function (models) {
        Project.belongsTo(models.Corporate, {
            foreignKey: {
                name: "customer",
            },
        });
        Project.hasMany(models.ProjectAccount, {
            foreignKey: {
                name: "project_id",
            },
        });
    };
    return Project;
};
