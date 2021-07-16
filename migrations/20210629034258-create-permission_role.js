"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        //permission_role
        await queryInterface.createTable("permission_role", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: 1,
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
        await queryInterface.createTable("permission_role_authorize", {
            permissionRoleId: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            page: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING,
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
        await queryInterface.dropTable('permission_role');
        await queryInterface.dropTable('permission_role_authorize');
    }
};