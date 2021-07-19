import {
    Table,
    PrimaryKey,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
    AllowNull,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";

import YearLeaveHour from "./YearLeaveHour.model";
import ExtraHoursReq from "./ExtraHoursReq.model";

@Table({
    tableName: "year_leave_hour_record",
    createdAt: "created_at",
    updatedAt: "updated_at",
})
class YearLeaveHourExtraRecord extends Model {
    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => YearLeaveHour)
    @Column({
        type: DataType.INTEGER,
        field: "year_leave_hour_id",
    })
    id: number;

    @PrimaryKey
    @AllowNull(false)
    @ForeignKey(() => ExtraHoursReq)
    @Column({
        type: DataType.INTEGER,
        field: "extrahoursreq_id",
    })
    extrahoursreqId: number;

    @AllowNull(false)
    @Column(DataType.FLOAT(11))
    hours: number;

    @CreatedAt
    @Column({
        field: "created_at",
    })
    createdAt: Date;

    @UpdatedAt
    @Column({
        field: "updated_at",
    })
    updatedAt: Date;

    @BelongsTo(() => YearLeaveHour)
    YearLeaveHour: YearLeaveHour;

    @BelongsTo(() => ExtraHoursReq)
    ExtraHoursReq: ExtraHoursReq;
}

export default YearLeaveHourExtraRecord;
