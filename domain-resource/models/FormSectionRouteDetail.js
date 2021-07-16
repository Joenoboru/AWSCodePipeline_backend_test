/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const FormSectionRouteDetail = sequelize.define('FormSectionRouteDetail', {
        formSectionId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'FormSection',
                key: 'id',
            },
            field: 'form_section_id',
        },
        routeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            references: {
                model: 'RouteDetail',
                key: 'routeId',
            },
            field: 'route_id',
        },
        stageNo: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            references: {
                model: 'RouteDetail',
                key: 'stageNo',
            },
            field: 'stage_no',
        },
        fieldType: {
            type: DataTypes.INTEGER(1),
            allowNull: false,
            field: 'field_type',
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
        tableName: 'form_section_route_detail',
        createdAt: 'createAt',
        updatedAt: 'updateAt',
    });

    // associations
    FormSectionRouteDetail.associate = function (models) {
        FormSectionRouteDetail.hasOne(models.FormSection, { foreignKey: "id", sourceKey: "formSectionId" });
    };
    FormSectionRouteDetail.removeAttribute('id');

    return FormSectionRouteDetail;

};
