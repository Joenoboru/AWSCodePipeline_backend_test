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
    tableName: "corporate",
})
class Corporate extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({ type: DataType.INTEGER })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    name: string;

    @Column(DataType.STRING(255))
    jpName: string;

    @Column(DataType.STRING(255))
    enName: string;

    @Column(DataType.STRING(20))
    companyStatus: string;

    @Column(DataType.STRING(20))
    equityStatus: string;

    @Column(DataType.INTEGER({ length: 30 }))
    capitalAmount: number;

    @Column(DataType.INTEGER({ length: 30 }))
    totalPaidinCapital: number;

    @Column(DataType.INTEGER({ length: 10 }))
    shareValue: number;

    @Column(DataType.INTEGER({ length: 30 }))
    equityAmount: number;

    @Column(DataType.STRING(50))
    registrationAuthority: string;

    @Column(DataType.STRING(20))
    registrationDate: string;

    @Column(DataType.STRING(20))
    lastModificationDate: string;

    @Column(DataType.BOOLEAN)
    specialVotingRights: boolean;

    @Column(DataType.BOOLEAN)
    specificIssuesVeto: boolean;

    @Column(DataType.BOOLEAN)
    specialShareholderRight: boolean;

    @Column(DataType.TEXT)
    businessScopet: string;

    @Column(DataType.STRING(8))
    zipCode: string;

    @Column(DataType.STRING(255))
    address: string;

    @Column(DataType.STRING(12))
    tel: string;

    @Column(DataType.STRING(12))
    fax: string;

    @Column(DataType.STRING(20))
    taxIdNumber: string;

    @Column(DataType.STRING(50))
    site: string;

    @Column(DataType.STRING(50))
    representName: string;

    @Column(DataType.STRING(20))
    representTitle: string;

    @Column(DataType.STRING(50))
    email: string;

    @Column(DataType.STRING(50))
    contactName: string;

    @Column(DataType.TEXT)
    remark: string;

    @Column(DataType.INTEGER)
    createdUser: number;

    @Column(DataType.INTEGER)
    updatedUser: number;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default Corporate;
