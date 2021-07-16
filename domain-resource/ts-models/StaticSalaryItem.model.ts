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
    tableName: "static_salary_items",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class StaticSalaryItem extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "static_salary_item_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(25))
    name: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    payment_type: number;

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

export default StaticSalaryItem;
