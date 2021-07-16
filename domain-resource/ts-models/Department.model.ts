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
import Corporate from "./Corporate.model";

@Table({
    tableName: "departments",
})
class Department extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    chname: string;

    @AllowNull(false)
    @ForeignKey(() => Corporate)
    @Column(DataType.INTEGER)
    corp: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    orgp: number;

    @AllowNull(false)
    @Column(DataType.BOOLEAN)
    status: boolean;

    @Column(DataType.STRING(200))
    rmk: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => Corporate)
    Corporate: Corporate;
}

export default Department;
