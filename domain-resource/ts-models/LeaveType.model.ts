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

import LeaveReq from "./LeaveReq.model";

@Table({
    tableName: "leave_type",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class LeaveType extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "leave_type_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;

    @Column(DataType.STRING)
    explain: string;

    @Column(DataType.BOOLEAN)
    exchange: string;

    @Column(DataType.JSON)
    repetitions: string;

    @Column(DataType.INTEGER)
    discount: number;

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

    @HasMany(() => LeaveReq)
    LeaveReqs: LeaveReq[];
}

export default LeaveType;
