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
    tableName: "google_user",
})
class GoogleUser extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.STRING)
    sub: string;

    @Column(DataType.STRING)
    name: string;

    @Column({
        type: DataType.STRING,
        field: "given_name",
    })
    givenName: string;

    @Column({
        type: DataType.STRING,
        field: "family_name",
    })
    familyName: string;

    @Column(DataType.STRING)
    picture: string;

    @Column(DataType.STRING)
    email: string;

    @Column({
        type: DataType.BOOLEAN,
        field: "email_verified",
    })
    emailVerified: boolean;

    @Column(DataType.STRING)
    locale: string;

    @Column(DataType.STRING)
    hd: string;

    @Column(DataType.STRING)
    domain: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default GoogleUser;
