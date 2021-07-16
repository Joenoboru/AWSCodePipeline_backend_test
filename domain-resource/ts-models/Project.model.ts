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
    BelongsTo,
    HasMany,
    ForeignKey,
} from "sequelize-typescript";
import Customer from "./Customer.model";
import ProjectCat from "./ProjectCat.model";
import ProjectAccount from "./ProjectAccount.model";

@Table({
    tableName: "projects",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class Project extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER, field: "project_id" })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    name: string;

    @AllowNull(false)
    @ForeignKey(() => Customer)
    @Column(DataType.INTEGER)
    customer: string;

    @Column({ type: DataType.INTEGER({ length: 4 }), field: "order_year" })
    orderYear: number;

    @Column({ type: DataType.INTEGER({ length: 2 }), field: "order_month" })
    orderMonth: number;

    @AllowNull(false)
    @ForeignKey(() => ProjectCat)
    @Column(DataType.INTEGER({ length: 2 }))
    cat: number;

    @Column(DataType.INTEGER)
    incharge: number;

    @Column({ type: DataType.DATEONLY, field: "dev_start" })
    devStart: Date;

    @Column({ type: DataType.DATEONLY, field: "dev_end" })
    devEnd: Date;

    @Column(DataType.TEXT)
    detail: string;

    @Column(DataType.TEXT)
    rmk: string;

    @Column(DataType.BIGINT({ length: 12 }))
    budget: number;

    @Column({ type: DataType.BIGINT({ length: 12 }), field: "cost_est" })
    costEst: number;

    @Column({ type: DataType.BIGINT({ length: 12 }), field: "cost_calc" })
    costCalc: number;

    @Column({ type: DataType.DECIMAL(8, 6), field: "cost_rate_calc" })
    costRateCalc: number;

    @Column({ type: DataType.DECIMAL(8, 6), field: "cost_rate_est" })
    costRateEst: number;

    @Column({ type: DataType.DECIMAL(8, 6), field: "used_rate" })
    usedRate: number;

    @AllowNull(false)
    @Column(DataType.INTEGER({ length: 2 }))
    status: number;

    @Column({ type: DataType.DATEONLY, field: "expected_date" })
    expectedDate: Date;

    @Column(DataType.BOOLEAN)
    selectable: number;

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

    @BelongsTo(() => Customer)
    Customer: Customer;

    @BelongsTo(() => ProjectCat)
    ProjectCat: ProjectCat;

    @HasMany(() => ProjectAccount)
    ProjectAccounts: ProjectAccount[];
}

export default Project;
