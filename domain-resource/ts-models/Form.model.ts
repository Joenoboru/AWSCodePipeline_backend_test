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
    BelongsToMany,
} from "sequelize-typescript";

import FormSection from "./FormSection.model";
import FormRoute from "./FormRoute.model";
import FormDept from "./FormDept.model";
import Route from "./Route.model";
import AuditRecord from "./AuditRecord.model";
import Department from "./Department.model";
@Table({
    tableName: "form",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class Form extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "form_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Column({ type: DataType.STRING, field: "form_tag" })
    formTag: string;

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

    @HasMany(() => FormSection)
    FormSections: FormSection[];

    @BelongsToMany(() => Route, () => FormRoute)
    Routes: Array<Route & { FormRoute: FormRoute }>;

    @BelongsToMany(() => Department, () => FormDept)
    Departments: Array<Route & { FormDept: FormDept }>;

    @HasMany(() => AuditRecord)
    AuditRecords: AuditRecord[];

    @HasMany(() => FormDept)
    FormDepts: FormDept[];
}

export default Form;
