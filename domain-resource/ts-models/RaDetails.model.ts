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
    Default,
} from "sequelize-typescript";

import RaHeader from "./RaHeader.model";

@Table({
    tableName: "ra_details",
})
class RaDetails extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "ra_details_id",
    })
    id: number;

    @AllowNull(false)
    @ForeignKey(() => RaHeader)
    @Column({
        type: DataType.INTEGER,
        field: "header_id",
    })
    headerId: number;

    @AllowNull(false)
    @Column({
        type: DataType.DATEONLY,
        field: "trans_date",
    })
    transDate: Date | string;

    @Column(DataType.STRING(10))
    invoice: string;

    @Column(DataType.STRING(200))
    comment: string;

    @Default(0.0)
    @Column(DataType.DECIMAL(16, 3))
    amount: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => RaHeader)
    RaHeader: RaHeader;
}

export default RaDetails;
