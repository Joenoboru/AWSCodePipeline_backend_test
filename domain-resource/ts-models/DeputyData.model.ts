import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import Employee from "./Employee.model";

@Table({
    tableName: "deputy_data",
    createdAt: "create_at",
    updatedAt: "update_at",
    indexes: [
        {
            unique: true,
            fields: ["employee", "date"],
        },
    ],
})
class DeputyData extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "emp_id",
    })
    empId: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "deputy_id",
    })
    deputyId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "seq_no",
    })
    seqNo: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    type: number;

    @Column({
        type: DataType.TIME,
        field: "start_at",
    })
    startAt: Date | string;

    @Column({
        type: DataType.TIME,
        field: "end_at",
    })
    endAt: Date | string;

    @Column(DataType.INTEGER({ length: 1 }))
    status: number;

    @Column({ type: DataType.INTEGER, field: "create_user" })
    createUser: number;

    @Column({ type: DataType.INTEGER, field: "update_user" })
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

    @BelongsTo(() => Employee, "empId")
    Employee: Employee;

    @BelongsTo(() => Employee, "deputyId")
    Deputy: Employee;
}

export default DeputyData;
