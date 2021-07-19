/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const FormSection = sequelize.define('FormSection', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'form_section_id',
        },
        formId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'Form',
                key: 'id',
            },
            field: 'form_id',
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        formSectionTag: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'form_section_tag',
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER(1),
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
        tableName: 'form_section',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    return FormSection;
};
