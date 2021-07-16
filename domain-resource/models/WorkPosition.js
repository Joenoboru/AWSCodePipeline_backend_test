'use strict';
module.exports = (sequelize, DataTypes) => {
    const WorkPosition = sequelize.define('WorkPosition', {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        chname: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        rmk: DataTypes.STRING(200),
        ord: DataTypes.INTEGER(11)
    }, { tableName: "workpositions", });
    //   WorkPosition.associate = function(models) {
    //     // associations can be defined here
    //   };
    return WorkPosition;
};