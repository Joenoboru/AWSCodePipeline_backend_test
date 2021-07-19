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

import RaTypeI18n from "./RaTypeI18n.model";

@Table({
    tableName: "ra_type",
})
class RaType extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ra_type_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    type: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "acc_item",
    })
    accItem: number;

    @Column(DataType.TEXT)
    rmk: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @HasMany(() => RaTypeI18n)
    RaTypeI18n: RaTypeI18n[];
}

export default RaType;
