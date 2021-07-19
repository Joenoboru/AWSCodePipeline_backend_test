import express, { Request, Response } from "express";
import { query, validationResult } from "express-validator";
import { ParamsDictionary, Query } from "express-serve-static-core";
import moment from "moment";
import { Op, WhereOptions } from "sequelize";
import { Workbook } from "exceljs";
import { RaHeader, RaBody } from "../domain-resource/ts-models";
import { ErrorDef } from "../wf_common";
import handleErrorAsync from "./handleErrorAsync";
import RaService from "../services/RaService";

//const express = require("express");
const router = express.Router();

const getRaDataWhere = (req: Request<ParamsDictionary, any, any, DetailsReqQuery>): RaDataWhere => {
    const headerWhere: WhereOptions<RaHeader> = {};
    const bodyWhere: WhereOptions<RaBody> = {};

    const dateWhere: DateWhere = {
        [Op.gte]: moment.utc(req.query.sdate).toDate(),
        [Op.lte]: moment.utc(req.query.edate).toDate(),
    };
    const status = req.query.status;
    if (Array.isArray(status)) {
        headerWhere.status = { [Op.in]: status.map((item) => Number(item)) };
    } else {
        if (status) {
            headerWhere.status = Number(req.query.status);
        }
    }
    const dateType = Number(req.query.dateType);
    if (dateType === 0) {
        headerWhere.transDate = dateWhere;
    } else if (dateType === 1) {
        headerWhere.payDate = dateWhere;
    }
    const payType = Number(req.query.payType);
    if (!Number.isNaN(payType) && payType !== 0) {
        headerWhere.payType = payType;
    }
    headerWhere.accountId = Number(req.query.accountId);
    if (payType === 2 && req.query.empId) {
        headerWhere.empId = Number(req.query.empId);
    } else if (payType === 3 && req.query.customerId) {
        headerWhere.customerId = Number(req.query.customerId);
    }
    return { headerWhere, bodyWhere };
};

async function exportExcel(res: Response, wb: Workbook): Promise<void> {
    const filename = "report_" + moment().format("YYYYMMDDHHmmss");
    const buffer = await wb.xlsx.writeBuffer({ filename });
    res.contentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
}

interface RaDataWhere {
    headerWhere: WhereOptions<RaHeader>;
    bodyWhere: WhereOptions<RaBody>;
}

router.get(
    "/details",
    [
        query("sdate").not().isEmpty(),
        query("edate").not().isEmpty(),
        query("dateType").not().isEmpty(),
        query("payType").not().isEmpty(),
    ],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, any, DetailsReqQuery>, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const { headerWhere, bodyWhere } = getRaDataWhere(req);
        const datas = await new RaService(req).queryDetail(
            headerWhere, //header
            bodyWhere //body
        );
        res.send(datas);
    })
);

router.get(
    "/details/export",
    [
        query("sdate").not().isEmpty(),
        query("edate").not().isEmpty(),
        query("dateType").not().isEmpty(),
        query("payType").not().isEmpty(),
    ],
    handleErrorAsync(async function (req: Request<ParamsDictionary, any, any, DetailsReqQuery>, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const { headerWhere, bodyWhere } = getRaDataWhere(req);
        const wb = await new RaService(req).exportDtlExcel(
            headerWhere, //header
            bodyWhere //body
        );
        await exportExcel(res, wb);
    })
);

router.get(
    "/stats",
    [
        query("sdate").not().isEmpty(),
        query("edate").not().isEmpty(),
        query("dateType").not().isEmpty(),
        query("payType").not().isEmpty(),
    ],
    handleErrorAsync(async (req: Request<ParamsDictionary, any, any, DetailsReqQuery>, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const { headerWhere, bodyWhere } = getRaDataWhere(req);
        const datas = await new RaService(req).queryStat(
            headerWhere, //header
            bodyWhere //body
        );
        res.send(datas);
    })
);

router.get(
    "/stats/export",
    [
        query("sdate").not().isEmpty(),
        query("edate").not().isEmpty(),
        query("dateType").not().isEmpty(),
        query("payType").not().isEmpty(),
    ],
    handleErrorAsync(async function (req: Request<ParamsDictionary, any, any, DetailsReqQuery>, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ status: "error", code: ErrorDef.formInvalid, errors: errors.array() });
        }
        const { headerWhere, bodyWhere } = getRaDataWhere(req);
        const wb = await new RaService(req).exportStatExcel(
            headerWhere, //header
            bodyWhere //body
        );
        await exportExcel(res, wb);
    })
);

export = router;

interface DateWhere {
    [Op.gte]: Date;
    [Op.lte]: Date;
}

interface DetailsReqQuery extends Query {
    //account: []
    accountId?: string;
    customerId?: string;
    empId?: string;
    dateType: string;
    edate: string;
    sdate: string;
    payType: string;
    status: string | string[];
    rmk?: string;
}
