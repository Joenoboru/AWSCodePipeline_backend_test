"use strict";

module.exports = function (sequelize, DataTypes) {
    const RaTypeI18n = sequelize.define(
        "RaTypeI18n",
        {
            raTypeId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "ra_type_id",
            },
            languageId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "language_id",
            },
            name: {
                type: DataTypes.STRING(50),
            },
        },
        {
            tableName: "ra_type_i18n",
            timestamps: false,
        }
    );
    return RaTypeI18n;
};
