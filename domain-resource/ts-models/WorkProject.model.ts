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
import Attendance from "./Attendance.model";
import Project from "./Project.model";

@Table({
    tableName: "workprojects",
})
class WorkProject extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Attendance)
    @Column({
        type: DataType.INTEGER,
        field: "attendance_id",
    })
    attendanceId: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    project: number;

    @Column(DataType.TEXT)
    detail: string;

    @Column(DataType.FLOAT)
    usetime: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => Attendance)
    Attendance: Attendance;

    @BelongsTo(() => Project)
    Project: Project;
}
export default WorkProject;
