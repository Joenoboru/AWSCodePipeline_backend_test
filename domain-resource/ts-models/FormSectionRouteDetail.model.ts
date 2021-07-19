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
} from "sequelize-typescript";
import FormSection from "./FormSection.model";
import Route from "./Route.model";

@Table({
    tableName: "form_section_route_detail",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class FormSectionRouteDetail extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @ForeignKey(() => FormSection)
    @Column({
        type: DataType.INTEGER,
        field: "form_section_id",
    })
    id: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => Route)
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
    @Column({ type: DataType.INTEGER({ length: 1 }), field: "field_type" })
    fieldType: number;

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

    @BelongsTo(() => FormSection)
    FormSection: FormSection;
}

export default FormSectionRouteDetail;
