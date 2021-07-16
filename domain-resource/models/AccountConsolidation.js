"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AccountConsolidation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    AccountConsolidation.init(
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
                field: "account_consolidation_id",
            },
            yearMonth: {
                type: DataTypes.STRING(6),
                unique: true,
               field: "year_month", 
            },
            currentPl: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                defaultValue: 0,
                field: "current_pl",
            },
            accumPl: {
                type: DataTypes.DECIMAL(16, 3),
                allowNull: false,
                defaultValue: 0,
                field: "accum_pl",
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            createdUser: {
                allowNull: true,
                type: DataTypes.INTEGER,
                field: "created_user",
            },
        },
        {
            sequelize,
            modelName: "AccountConsolidation",
            tableName: "account_consolidation",
        }
    );
    return AccountConsolidation;
};
