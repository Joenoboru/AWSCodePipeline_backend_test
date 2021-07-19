import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    AllowNull,
} from "sequelize-typescript";

@Table({
    tableName: "bank_code",
    timestamps: false,
})
class BankCode extends Model {
    @AllowNull(false)
    @Column(DataType.STRING(10))
    name: string;

    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.STRING(50))
    code: string;
}

export default BankCode;
