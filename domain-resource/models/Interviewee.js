/* jshint indent: 2 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    const Interviewee = sequelize.define('Interviewee', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'interviewee_id',
        },
        nameKana: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'name_kana',
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        sex: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        birthday: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            set (valueToBeSet) { 
                this.setDataValue('birthday', valueToBeSet)
            },
        },
        married: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        fristVisitJPDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'frist_visit_jp_date',
            set (valueToBeSet) { 
                this.setDataValue('fristVisitJPDate', valueToBeSet)
            },
        },
        jpLangLevel: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'jp_lang_level',
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        tel: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        nearestStationLine: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'nearest_station_line',
        },
        nearestStation: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'nearest_station',
        },
        commuteTime: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'commute_time',
        },
        managePeople: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'manage_people',
        },
        educations: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'educations',
        },
        careers: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'careers',
        },
        workExperience: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'work_experience',
        },
        skills: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'skills',
        },
        experiences: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'experiences',
        },
        proudSkill: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'proud_skill',
        },
        proudBusiness: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'proud_business',
        },
        email: {
            type: DataTypes.STRING(70),
            allowNull: true,
        },
        remark: {
            type: DataTypes.STRING(2048),
            allowNull: true,
        },
        utilizeExpRemark: {
            type: DataTypes.STRING(4096),
            allowNull: true,
            field: 'utilize_exp_remark',
        },
        utilizeKnowledgeRemark: {
            type: DataTypes.STRING(4096),
            allowNull: true,
            field: 'utilize_knowledge_remark',
        },
        utilizeSkillRemark: {
            type: DataTypes.STRING(4096),
            allowNull: true,
            field: 'utilize_skill_remark',
        },
        isHired: {
            type: DataTypes.STRING(1),
            allowNull: true,
            field: 'is_hired',
        },
        status: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        createUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'create_user',
        },
        createAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'create_at',
        },
        updateUser: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'update_user',
        },
        updateAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'update_at',
        },
    }, {
        tableName: 'interviewee',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // Interviewee.associate = function (models) {
    // };

    return Interviewee;
};
