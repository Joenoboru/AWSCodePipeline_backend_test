"use strict";

module.exports = function (sequelize, DataTypes) {
    const RaItemI18n = sequelize.define(
        "RaItemI18n",
        {
            raItemId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "ra_item_id",
            },
            languageId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "language_id",
            },
            name: {
                type: DataTypes.STRING(100),
            },
            rmk: {
                type: DataTypes.STRING(200),
            },
        },
        {
            tableName: "ra_item_i18n",
            timestamps: false,
        }
    );
    return RaItemI18n;
};
