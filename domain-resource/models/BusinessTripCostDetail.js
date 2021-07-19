/* jshint indent: 2 */
"use strict";

module.exports = function (sequelize, DataTypes) {
    const BusinessTripCostDetail = sequelize.define(
        "BusinessTripCostDetail",
        {
            businessTripId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "business_trip_id",
            },
            accountingDetailsId: {
                type: DataTypes.INTEGER(11),
                allowNull: false,
                primaryKey: true,
                field: "accounting_details_id",
            },
        },
        {
            tableName: "business_trip_cost_detail",
            timestamps: false,
        }
    );
    BusinessTripCostDetail.removeAttribute("id");
    BusinessTripCostDetail.associate = function (models) {
        BusinessTripCostDetail.belongsTo(models.BusinessTrip, { foreignKey: "businessTripId", sourceKey: "id" });
        BusinessTripCostDetail.belongsTo(models.AccountingDetails, { foreignKey: "accountingDetailsId", sourceKey: "id" });
        //
    };

    return BusinessTripCostDetail;
};
