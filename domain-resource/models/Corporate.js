"use strict";
module.exports = (sequelize, DataTypes) => {
    const Corporate = sequelize.define(
        "Corporate",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "corporate_id",
            },
            name: DataTypes.STRING(50),
            chname: DataTypes.STRING(50),
            engname: DataTypes.STRING(50),
            // type: DataTypes.INTEGER(2),
            cat: DataTypes.STRING(50),
            zipcode: DataTypes.STRING(8),
            address: DataTypes.STRING(256),
            tel: DataTypes.STRING(12),
            fax: DataTypes.STRING(12),
            code: DataTypes.STRING(20),
            site: DataTypes.STRING(50),
            branch: DataTypes.STRING(50),
            represent_name: DataTypes.STRING(50),
            represent_title: DataTypes.STRING(20),
            email: DataTypes.STRING(50),
            cont_name: DataTypes.STRING(50),
            incharge: DataTypes.INTEGER,
            rmk: DataTypes.TEXT,
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
            tableName: "corporates",
            createdAt: "create_at",
            updatedAt: "update_at",
        }
    );
    // Corporate.associate = function (models) {
    //     // associations can be defined here
    // };
    return Corporate;
};
