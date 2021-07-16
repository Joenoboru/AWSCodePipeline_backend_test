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
    BelongsTo
} from "sequelize-typescript";
import Route from "./Route.model";
import Employee from "./Employee.model";

@Table({
    tableName: "route_detail",
    createdAt: "create_at",
    updatedAt: "update_at",
})

class RouteDetail extends Model {
    @PrimaryKey
    @ForeignKey(() => Route)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "route_id",
    })
    routeId: number;

    @PrimaryKey
    @AllowNull(false)
    @Column({ type: DataType.INTEGER({ length: 1 }), field: "stage_no" })
    stageNo: number;

    @AllowNull(false)
    @Column({ type: DataType.INTEGER({ length: 1 }), field: "audit_type" })
    auditType: number;

    @Column({ type: DataType.INTEGER, field: "dept_id" })
    deptId: number;

    @Column({ type: DataType.INTEGER, field: "grade_id" })
    gradeId: number;

    @ForeignKey(() => Employee)
    @Column({ type: DataType.INTEGER, field: "auditor_id" })
    auditorId: number;

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

    @BelongsTo(() => Route)
    Route: Route;
}

export default RouteDetail;
