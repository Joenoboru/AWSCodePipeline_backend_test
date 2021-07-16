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
} from "sequelize-typescript";

@Table({
    tableName: "customers",
    createdAt: "create_at",
    updatedAt: "update_at",
})
class Customer extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "customer_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;

    @Column(DataType.STRING(50))
    chname: string;

    @Column(DataType.STRING(50))
    engname: string;

    @Column(DataType.STRING(50))
    cat: string;

    @Column(DataType.STRING(8))
    zipcode: string;

    @Column(DataType.STRING(256))
    address: string;

    @Column(DataType.STRING(12))
    tel: string;

    @Column(DataType.STRING(12))
    fax: string;

    @Column(DataType.STRING(20))
    code: string;

    @Column(DataType.STRING(50))
    site: string;

    @Column(DataType.STRING(50))
    branch: string;

    @Column(DataType.STRING(50))
    represent_name: string;

    @Column(DataType.STRING(20))
    represent_title: string;

    @Column(DataType.STRING(50))
    email: string;

    @Column(DataType.STRING(50))
    cont_name: string;

    @Column(DataType.INTEGER)
    incharge: number;

    @Column(DataType.TEXT)
    rmk: string;

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
}

export default Customer;
