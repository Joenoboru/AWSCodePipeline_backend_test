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
    Default,
    Unique,
} from "sequelize-typescript";

@Table({
    tableName: "account_consolidation",
})
class AccountConsolidation extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "account_consolidation_id",
    })
    id: number;

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.STRING(6),
        field: "year_month",
    })
    yearMonth: string;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "current_pl",
    })
    currentPl: number;

    @AllowNull(false)
    @Default(0)
    @Column({
        type: DataType.DECIMAL(16, 3),
        field: "accum_pl",
    })
    accumPl: number;

    @Column({ type: DataType.INTEGER, field: "created_user" })
    createdUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default AccountConsolidation;
