"use strict";
module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define(
        "Message",
        {
            id: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
                field: "message_id",
            },
            email: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            contents: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            link: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            type: {
                type: DataTypes.INTEGER(2),
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                field: "is_read",
            },
            msgkey: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            createAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "create_at",
            },
            updateAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: "update_at",
            },
        },
        { tableName: "message", createdAt: "create_at", updatedAt: "update_at" }
    );
    // Message.associate = function (models) {
    //     // associations can be defined here

    // };
    return Message;
};
