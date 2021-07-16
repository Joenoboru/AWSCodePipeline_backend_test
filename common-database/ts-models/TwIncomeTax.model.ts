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
    tableName: "tw_income_tax",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class TwIncomeTax extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.BIGINT)
    id: number;

    @Column(DataType.STRING(50))
    version: string;

    @Column(DataType.INTEGER)
    amount: number;

    @Column(DataType.INTEGER)
    dependents: number;

    @Column(DataType.INTEGER)
    tax: number;

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

export default TwIncomeTax;
