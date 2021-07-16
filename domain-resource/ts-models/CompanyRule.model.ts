import {
    Table,
    PrimaryKey,
    AutoIncrement,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    AllowNull,
} from "sequelize-typescript";

@Table({
    tableName: "company_rule",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class CompanyRule extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "company_rule_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    timezone: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    offday: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    holiday: number;

    @Column({
        type: DataType.TIME,
        field: "work_on",
    })
    workOn: Date | string;

    @Column({
        type: DataType.TIME,
        field: "work_off",
    })
    workOff: Date | string;

    @Column({
        type: DataType.TIME,
        field: "break_start",
    })
    breakStart: Date | string;

    @Column({
        type: DataType.TIME,
        field: "break_end",
    })
    breakEnd: Date | string;

    @Column({
        type: DataType.INTEGER,
        field: "main_currency",
    })
    mainCurrency: number;

    @Column({
        type: DataType.INTEGER,
        field: "extra_limit_minutes",
    })
    extraLimitMinutes: number;

    @CreatedAt
    @Column({
        field: "created_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "updated_at",
    })
    updatedAt: Date;
}

export default CompanyRule;
