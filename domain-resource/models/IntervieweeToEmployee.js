/* jshint indent: 2 */
'use strict';

module.exports = function (sequelize, DataTypes) {
    const IntervieweeToEmployee = sequelize.define('IntervieweeToEmployee', {
        intervieweeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'interviewee_id',
        },
        employeeId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            field: 'employee_id',
        },

    }, {
        tableName: 'interviewee_to_employee',
        timestamps: false,
    });
    IntervieweeToEmployee.removeAttribute('id');
    // IntervieweeToEmployee.associate = function (models) {
    // };

    return IntervieweeToEmployee;
};
