"use strict";
module.exports = (sequelize, DataTypes) => {
    const ProjectCat = sequelize.define(
        "ProjectCat",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "project_cat_id",
            },
            name: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
            rmk: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "created_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "updated_at",
            },
        },
        { tableName: "project_cats" }
    );
    /*ProjectCat.associate = function (models) {
        // associations can be defined here
    };*/
    return ProjectCat;
};
