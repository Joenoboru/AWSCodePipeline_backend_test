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
import Form from "./Form.model";
import Route from "./Route.model";

@Table({
    tableName: "form_route",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class FormRoute extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Form)
    @Column({
        type: DataType.INTEGER,
        field: "form_id",
    })
    formId: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Route)
    @Column({
        type: DataType.INTEGER,
        field: "route_id",
    })
    routeId: number;

    @Column(DataType.STRING)
    name: string;

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

    @BelongsTo(() => Form)
    Form: Form;

    @BelongsTo(() => Route)
    Route: Route;
}

export default FormRoute;
