import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    AllowNull,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    //TODO: [typo]table name should be changed
    tableName: "insurance_hier",
    createdAt: "create_at",
    updatedAt: "update_at",
    indexes: [
        {
            unique: true,
            fields: ["version", "level"],
        },
    ],
})
class InsuranceHirer extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.STRING(10))
    version: string;

    @Column(DataType.INTEGER)
    level: number;

    @Column(DataType.INTEGER)
    amount: number;

    @Column({
        type: DataType.INTEGER,
        field: "social_insurance_person",
    })
    socialInsurancePerson: number;

    @Column({
        type: DataType.INTEGER,
        field: "social_insurance_company",
    })
    socialInsuranceCompany: number;

    @Column({
        type: DataType.INTEGER,
        field: "health_insurance_person",
    })
    healthInsurancePerson: number;

    @Column({
        type: DataType.INTEGER,
        field: "health_insurance_company",
    })
    healthInsuranceCompany: number;

    @Column(DataType.INTEGER)
    pension: number;

    //TODO: this field will be removed
    @Column({
        type: DataType.INTEGER,
        field: "create_user",
    })
    createdUser: number;

    //TODO: this field will be removed
    @Column({
        type: DataType.INTEGER,
        field: "update_user",
    })
    updatedUser: number;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: "create_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: "update_at",
    })
    updatedAt: Date;
}

export default InsuranceHirer;
