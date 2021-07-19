"use strict";

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class AccountItemI18n extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        /*static associate(models) {
            // define association here
        }*/
    }
    AccountItemI18n.init(
        {
            accountItemId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "account_item_id",
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
            sequelize,
            modelName: "AccountItemI18n",
            tableName: "accountitem_i18n",
        }
    );
    return AccountItemI18n;
};
