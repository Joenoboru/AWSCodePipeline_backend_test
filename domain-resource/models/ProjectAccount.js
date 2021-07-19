
"use strict";
module.exports = (sequelize, DataTypes) => {
    const ProjectAccount = sequelize.define(
        "ProjectAccount",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "project_account_id",
            },
            title: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            amount: {
                type: DataTypes.INTEGER(12),
                allowNull: false,
            },
            project_id: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
            },
            rmk: {
                type: DataTypes.STRING(256),
                allowNull: true,
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
        { tableName: 'project_accounts', createdAt: "create_at", updatedAt: "update_at" }
    );
    ProjectAccount.associate = function (models) {
        ProjectAccount.belongsTo(models.Project, {
            foreignKey: {
                name: "project_id",
            },
        });
        // associations can be defined here
    };
    return ProjectAccount;
};
