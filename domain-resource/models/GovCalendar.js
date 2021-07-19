"use strict";
module.exports = (sequelize, DataTypes) => {
    const GovCalendar = sequelize.define(
        "GovCalendar",
        {
            date: DataTypes.DATEONLY,
            name: DataTypes.STRING,
            isHoliday: DataTypes.BOOLEAN ,
            holidayCategory: DataTypes.STRING,
            description: DataTypes.STRING,
        },
        {tableName: 'goverment_calendar'}
    );

    return GovCalendar;
};
