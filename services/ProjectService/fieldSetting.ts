import { fn, col } from "sequelize";
export const sortable = [
    "id",
    "name",
    "customer",
    "orderYear",
    "orderMonth",
    "cat",
    "status",
    "incharge",
    "budget",
    "costEst",
    "costCalc",
    "costRateEst",
    "costRateCalc",
    "usedRate",
    "selectable",
];
export const searchable = ["name"];
export const fillable = [
    "name",
    "customer",
    "orderYear",
    "orderMonth",
    "cat",
    "incharge",
    "devStart",
    "devEnd",
    "detail",
    "rmk",
    "budget",
    "status",
    "selectable",
    "expectedDate",
    "costEst",
    "costRateEst",
];

export const accountFillable = ["title", "amount", "rmk", "project_id"];

export const orderDateField = [
    fn("STR_TO_DATE", fn("CONCAT", col("order_year"), " ", col("order_month"), " 01"), "%Y %c %e"),
    "orderDate",
];
