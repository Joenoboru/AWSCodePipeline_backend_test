"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("permission_role_authorize", {
            permissionRoleId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            page: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING(255),
            },
            read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            write: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable('permission_role_authorize');
    }
};