"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("corporate", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            jpName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            enName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            companyStatus: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            equityStatus: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            capitalAmount: {
                type: Sequelize.INTEGER(30),
                allowNull: true,
            },
            totalPaidinCapital: {
                type: Sequelize.INTEGER(30),
                allowNull: true,
            },
            shareValue: {
                type: Sequelize.INTEGER(10),
                allowNull: true,
            },
            equityAmount: {
                type: Sequelize.INTEGER(30),
                allowNull: true,
            },
            registrationAuthority: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            registrationDate: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            lastModificationDate: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            specialVotingRights: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            specificIssuesVeto: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            specialShareholderRight: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
            },
            businessScope: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            zipCode: {
                type: Sequelize.STRING(8),
                allowNull: true,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tel: {
                type: Sequelize.STRING(12),
                allowNull: true,
            },
            fax: {
                type: Sequelize.STRING(12),
                allowNull: true,
            },
            taxIdNumber: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            site: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            representName: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            representTitle: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            contactName: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            remark: {
                type: Sequelize.TEXT,
                allowNull: true,
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
        await queryInterface.dropTable('corporate');
    }
};