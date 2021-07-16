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
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import SalaryItem from "./SalaryItem.model";
import WorkLevel from "./WorkLevel.model";

@Table({
    tableName: "salarylvs",
    createdAt: "create_at",
    updatedAt: "update_at",
    indexes: [
        {
            name: "uniItemSLv",
            unique: true,
            fields: ["item", "level"],
        },
    ],
})
class SalaryLv extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "salarylv_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => WorkLevel)
    @Column(DataType.INTEGER)
    level: number;

    @AllowNull(false)
    @ForeignKey(() => SalaryItem)
    @Column(DataType.INTEGER)
    item: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    amount: number;

    @Column(DataType.STRING(50))
    rmk: string;

    @Column({
        type: DataType.INTEGER,
        field: "create_user",
    })
    createUser: number;

    @Column({
        type: DataType.INTEGER,
        field: "update_user",
    })
    updateUser: number;

    @CreatedAt
    @Column({
        field: "create_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "update_at",
    })
    updatedAt: Date;

    @BelongsTo(() => SalaryItem)
    SalaryItem: SalaryItem;

    @BelongsTo(() => WorkLevel)
    WorkLevel: WorkLevel;
}
export default SalaryLv;
