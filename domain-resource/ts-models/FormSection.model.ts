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
import Form from "./Form.model";

@Table({
    tableName: "form_section",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class FormSection extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "form_section_id",
    })
    id: number;

    @ForeignKey(() => Form)
    @Column({ type: DataType.INTEGER, field: "form_id" })
    formId: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Column({ type: DataType.STRING, field: "form_section_tag" })
    formSectionTag: string;

    @Column(DataType.STRING)
    description: string;

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

    @BelongsTo(() => Form)
    Form: Form;
}

export default FormSection;
