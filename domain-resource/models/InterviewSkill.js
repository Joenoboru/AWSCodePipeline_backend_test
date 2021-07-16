/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const InterviewSkill = sequelize.define('InterviewSkill', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'interview_skill_id',
        },
        type: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'type',
        },
        skillName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'skill_name'
        },
        skillType: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            field: 'skill_type'
        },
    }, {
        tableName: 'interview_skill',
        timestamps: false
    });
    // InterviewSkill.removeAttribute('createdAt');
    // InterviewSkill.removeAttribute('updatedAt');
    // // InterviewSkill.associate = function (models) {

    // };

    return InterviewSkill;
};
