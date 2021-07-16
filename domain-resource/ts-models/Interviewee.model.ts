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
    BelongsToMany,
} from "sequelize-typescript";
import Employee from "./Employee.model";
import IntervieweeToEmployee from "./IntervieweeToEmployee.model";

@Table({
    tableName: "interviewee",
    createdAt: "create_at",
    updatedAt: "update_at",
})

//TODO: some fields length should the same with Employee.
class Interviewee extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "interviewee_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @Column({ type: DataType.STRING, field: "name_kana" })
    nameKana: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    type: string;

    @AllowNull(false)
    @Column(DataType.STRING(1))
    sex: string;

    @Column(DataType.DATEONLY)
    birthday: Date | string;

    @Column(DataType.STRING(1))
    married: string;

    @Column({
        type: DataType.DATEONLY,
        field: "frist_visit_jp_date", //TODO: typo
    })
    fristVisitJPDate: Date | string;

    @Column({
        type: DataType.JSON,
        field: "jp_lang_level",
    })
    jpLangLevel: string;

    @Column(DataType.STRING)
    address: string;

    @Column(DataType.STRING(50))
    tel: string;

    @Column(DataType.STRING(50))
    mobile: string;

    @Column(DataType.STRING(50))
    email: string;

    @Column({
        type: DataType.STRING(50),
        field: "nearest_station_line",
    })
    nearestStationLine: string;

    @Column({
        type: DataType.STRING(50),
        field: "nearest_station",
    })
    nearestStation: string;

    @Column({
        type: DataType.INTEGER,
        field: "commute_time",
    })
    commuteTime: number;

    @Column({
        type: DataType.INTEGER,
        field: "manage_people",
    })
    managePeople: number;

    @Column(DataType.JSON)
    educations: string;

    @Column(DataType.JSON)
    careers: string;

    @Column({
        type: DataType.JSON,
        field: "work_experience",
    })
    workExperience: string;

    @Column(DataType.JSON)
    skills: string;

    @Column(DataType.JSON)
    experiences: string;

    @Column({
        type: DataType.TEXT,
        field: "proud_skill",
    })
    proudSkill: string;

    @Column({
        type: DataType.TEXT,
        field: "proud_business",
    })
    proudBusiness: string;

    @Column(DataType.STRING(2048))
    remark: string;

    @Column({
        type: DataType.STRING(4096),
        field: "utilize_exp_remark",
    })
    utilizeExpRemark: string;

    @Column({
        type: DataType.STRING(4096),
        field: "utilize_knowledge_remark",
    })
    utilizeKnowledgeRemark: string;

    @Column({
        type: DataType.STRING(4096),
        field: "utilize_skill_remark",
    })
    utilizeSkillRemark: string;

    @Column({
        type: DataType.STRING(1),
        field: "is_hired",
    })
    isHired: string;

    @Column(DataType.STRING(1))
    status: string;

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

    @BelongsToMany(() => Employee, () => IntervieweeToEmployee)
    Employee: Array<Employee & { IntervieweeToEmployee: IntervieweeToEmployee }>;
}

export default Interviewee;
