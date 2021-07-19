import { Table, PrimaryKey, Column, Model, DataType, AllowNull, AutoIncrement } from "sequelize-typescript";

@Table({
    tableName: "pages",
    timestamps: false,
})
class Page extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.TEXT)
    comment: string;

    @Column(DataType.STRING(50))
    type: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    name: string;

    @Column(DataType.STRING(50))
    i18n: string;

    @Column(DataType.JSON)
    icon: any;

    @Column(DataType.STRING(50))
    url: string;

    @Column(DataType.STRING(50))
    durl: any;

    @Column(DataType.JSON)
    resource: any;
}

export default Page;
