import { Table, PrimaryKey, AutoIncrement, Column, Model, DataType, AllowNull } from "sequelize-typescript";

@Table({
    tableName: "interview_skill",
    timestamps: false,
})
class InterviewSkill extends Model {
    @PrimaryKey
    @AutoIncrement
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        field: "interview_skill_id",
    })
    id: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    type: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        field: "skill_name",
    })
    skillName: string;

    @Column({
        type: DataType.INTEGER({ length: 1 }),
        field: "skill_type",
    })
    skillType: number;
}

export default InterviewSkill;
