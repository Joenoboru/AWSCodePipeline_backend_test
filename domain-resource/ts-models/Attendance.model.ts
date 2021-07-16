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
    HasMany,
} from "sequelize-typescript";
import Employee from "./Employee.model";
import WorkProject from "./WorkProject.model";

@Table({
    tableName: "attendances",
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
        {
            unique: true,
            fields: ["employee", "date"],
        },
    ],
})
class Attendance extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "attendance_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.DATEONLY)
    date: string;

    @Column({
        type: DataType.TIME,
        field: "in_time",
    })
    inTime: string;

    @Column({
        type: DataType.TIME,
        field: "out_time",
    })
    outTime: string;

    @Column({
        type: DataType.FLOAT,
        field: "break_time",
    })
    breakTime: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 1 }))
    comp: number;

    @AllowNull(false)
    @ForeignKey(() => Employee)
    @Column({
        type: DataType.INTEGER,
        field: "employee_id",
    })
    employee: number;

    @Column(DataType.BOOLEAN)
    reviewed: boolean;

    @Column(DataType.TEXT)
    rmk: string;

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

    @BelongsTo(() => Employee)
    Employee: Employee;

    @HasMany(() => WorkProject)
    WorkProjects: WorkProject[];
}

export default Attendance;
