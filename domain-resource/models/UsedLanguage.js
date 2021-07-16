/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const UsedLanguage = sequelize.define('UsedLanguage', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'language_id',
        },

    }, {
        tableName: 'used_language',
        timestamps: false
    });

    // UsedLanguage.associate = function (models) {

    // };

    return UsedLanguage;
};
