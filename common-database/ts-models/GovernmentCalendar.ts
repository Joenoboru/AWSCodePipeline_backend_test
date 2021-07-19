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
    tableName: "goverment_calendar",
})
class GovernmentCalendar extends Model {
    @PrimaryKey
    @AllowNull(false)
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @Column(DataType.DATEONLY)
    date: string;

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.BOOLEAN)
    isHoliday: boolean;

    @Column(DataType.STRING)
    holidayCategory: string;

    @Column(DataType.STRING)
    description: string;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}

export default GovernmentCalendar;
