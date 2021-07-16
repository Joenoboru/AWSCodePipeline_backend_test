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
    HasMany,
} from "sequelize-typescript";

import SalaryLv from "./SalaryLv.model";

@Table({
    tableName: "salary_items",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class SalaryItem extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "salary_item_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(25))
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING(25))
    chname: string;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    order: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    payment_type: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    wl_only: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    default_amount: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    tax_type: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    perday_use: number;

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

    @HasMany(() => SalaryLv)
    SalaryLvs: SalaryLv[];
}

export default SalaryItem;
