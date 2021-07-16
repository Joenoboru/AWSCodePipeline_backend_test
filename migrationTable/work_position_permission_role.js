"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("work_position_permission_role", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            workPositionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            permissionRoleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            createdUser: {
                allowNull: true,
                type: Sequelize.INTEGER
            },
            updatedUser: {
                allowNull: true,
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('work_position_permission_role');
    }
};