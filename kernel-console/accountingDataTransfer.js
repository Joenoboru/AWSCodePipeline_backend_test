const DomainDB = require("../domain-resource/indexBack1");
const { Op } = require("sequelize");
const moment = require("moment");
const dbConfig = require("../config/config.json");
const domain = dbConfig.development.database;
console.log(domain);

/*const { AuditRecord, RaHeader, RaBody, RaDetails, RaTransfer, sequelize } = DomainDB();
let aisData = []; //account item settings
let pl2ItemData = [];
let pl3ItemData = [];
const tempNo = {
    [RaHeader]: {},
    [RaBody]: {},
};

async function process() {
    const res = await AuditRecord.findAll({
        where: {
            formId: [14, 15, 16, 17],
            create_at: {
                [Op.lt]: "2021-02-18",
            },
            status: 2,
        },
    });
    const raHeader = [];
    const raTrans = [];
    res.forEach((row) => {
        const ymd = moment(new Date(row.createAt)).format("YYYYMMDD");
        if ([14, 15, 16].indexOf(row.formId) > -1) {
            tempNo[RaHeader][ymd] = Number(`${ymd}001`);
        }
        if (row.formId === 17) {
            tempNo[RaTransfer][ymd] = Number(`${ymd}001`);
        }
    });
    const loadRaHeaderNoAsyncs = Object.keys(tempNo[RaHeader]).map((key) => loadLastDataNo(RaHeader, key));
    const loadRaTransNoAsyncs = Object.keys(tempNo[RaTransfer]).map((key) => loadLastDataNo(RaTransfer, key));
    await Promise.all([...loadRaHeaderNoAsyncs, ...loadRaTransNoAsyncs]);
    await loadSettings();
    res.forEach((row) => {
        const auditData = row.auditData;
        const commonData = {
            id: null,
            //no: null,
            attachment: [],
            createAt: row.createAt,
            createdUser: row.createUser,
            updatedAt: row.updateAt,
            updateUser: row.updateUser,
        };
        const ymd = moment(new Date(row.createAt)).format("YYYYMMDD");
        if (row.formId === 14) {
            const incomeData = auditData.income.map((incomeRow) => {
                return {
                    transDate: incomeRow.expectedPaymentDate,
                    invoice: null,
                    comment: incomeRow.comment,
                    amount: incomeRow.amount,
                };
            });
            const accItem = getAccItem(0, auditData.pl2, auditData.pl3);
            const mRow = {
                no: tempNo[RaHeader][ymd]++,
                transDate: auditData.expectedPaymentDate,
                payDate: auditData.paymentDate,
                type: 0,
                inAmount: auditData.amount,
                outAmount: 0,
                taxRate: 5,
                invoice: null,
                status: 3,
                payType: 1,
                source: 9,
                accountId: auditData.inAccount,
                rmk: auditData.comment,
                ...commonData,
                RaBodies: [
                    {
                        accItem,
                        inAmount: auditData.incomeTotal,
                        outAmount: 0,
                        mainRow: 1,
                        taxType: 1,
                        rmk: auditData.comment,
                    },
                ],
                RaDetails: incomeData,
            };
            raHeader.push(mRow);
        }
        if (row.formId === 15) {
            const dtlData = auditData.detail;
            dtlData.forEach((subRow) => {
                const accItem = getAccItem(0, subRow.pl2, subRow.pl3);
                const mRow = {
                    no: tempNo[RaHeader][ymd]++,
                    transDate: subRow.expectedPaymentDate,
                    payDate: subRow.paymentDate,
                    type: 0,
                    inAmount: subRow.amount,
                    outAmount: 0,
                    taxRate: 5,
                    status: 3,
                    payType: 1,
                    source: 9,
                    accountId: auditData.inAccount,
                    invoice: subRow.invoice,
                    rmk: subRow.comment,
                    ...commonData,
                    RaBodies: [
                        {
                            accItem,
                            inAmount: subRow.amount,
                            outAmount: 0,
                            mainRow: 0,
                            taxType: 1,
                            rmk: subRow.comment,
                        },
                    ],
                    RaDetails: [],
                };
                raHeader.push(mRow);
            });
        }
        if (row.formId === 16) {
            const dtlData = auditData.detail;
            dtlData.forEach((subRow) => {
                const accItem = getAccItem(1, subRow.pl2, subRow.pl3);
                const mRow = {
                    no: tempNo[RaHeader][ymd]++,
                    transDate: subRow.expectedPaymentDate,
                    payDate: subRow.paymentDate,
                    type: 1,
                    inAmount: 0,
                    outAmount: subRow.amount,
                    taxRate: 5,
                    status: 3,
                    payType: 1,
                    source: 9,
                    accountId: auditData.inAccount,
                    invoice: subRow.invoice,
                    rmk: subRow.comment,
                    ...commonData,
                    RaBodies: [
                        {
                            accItem,
                            inAmount: 0,
                            outAmount: subRow.amount,
                            mainRow: 0,
                            taxType: 1,
                            rmk: subRow.comment,
                        },
                    ],
                    RaDetails: [],
                };
                raHeader.push(mRow);
            });
        }
        if (row.formId === 17) {
            const mRow = {
                no: tempNo[RaTransfer][ymd]++,
                date: auditData.paymentDate,
                inAccount: auditData.inAccount,
                outAccount: auditData.outAccount,
                amount: auditData.amount,
                rmk: auditData.comment,
                fee: auditData.fee.amount,
                feeTarget: 1,
                status: 1,
                ...commonData,
            };
            raTrans.push(mRow);
        }
    });
    console.log("Start writing data to database");
    await sequelize.transaction(async (transaction) => {
        const raHeaderSavePromises = raHeader
            .filter((row) => row.payDate && row.transDate && row.accountId)
            .map((row) => saveRaData(row, transaction));
        const raTransSavePromises = raTrans.map((row) => saveRaTrans(row, transaction));
        await Promise.all([...raHeaderSavePromises, ...raTransSavePromises]).then(() => {
            console.log("Done!");
        });
        /*.catch((err) => {
                //console.log(err);
            })*/
    //});
    /*console.log("===raHeader===");
    console.log(JSON.stringify(raHeader));
    console.log("===raTrans===");
    console.log(JSON.stringify(raTrans));
    console.log("=============");*/
//}

/*
function getAccItem(type, pl2 = null, pl3 = null) {
    if (pl3 !== null) {
        const pl3item = pl3ItemData.find((item) => (item.id = pl3));
        if (pl3 && Number(pl3item.code)) {
            return Number(pl3item.code);
        }
    }
    if (pl2 !== null) {
        const pl2item = pl2ItemData.find((item) => (item.id = pl2));
        if (pl2 && Number(pl2item.code)) {
            return Number(pl2item.code);
        }
    }
    const ais = aisData.find((item) => {
        if (type === 0) return item.tag === "in";
        if (type === 1) return item.tag === "ex";
        return false;
    });
    if (ais) {
        return Number(ais.accItem);
    }
    return null;
}

async function loadSettings() {
    const { ProfitLoss2nd, ProfitLoss3rd, AccountItemSetting } = DomainDB();
    aisData = await AccountItemSetting.findAll({
        attributes: ["tag", "accItem"],
        where: { tag: ["ex", "in"] },
        raw: true,
    });

    pl2ItemData = await ProfitLoss2nd.findAll({
        attributes: ["id", "code"],
        raw: true,
    });
    pl3ItemData = await ProfitLoss3rd.findAll({
        attributes: ["id", "code"],
        raw: true,
    });
}

async function saveRaData(data, transaction) {
    //data.no = await generateDataNo(RaHeader, data.transDate, transaction);
    const model = await RaHeader.create(data, {
        transaction,
        include: [RaBody, RaDetails],
    });
    await model.save({ transaction });
}

async function saveRaTrans(data, transaction) {
    //data.no = await generateDataNo(RaTransfer, data.date, transaction);
    console.log(data.no);
    const model = await RaTransfer.create(data, {
        transaction,
    });
    await model.save({ transaction });
}

async function loadLastDataNo(model, ymd) {
    const lastRow = await model.findOne({
        attributes: ["no"],
        where: {
            no: { [Op.between]: [Number(`${ymd}000`), Number(`${ymd}999`)] },
        },
        order: [["no", "DESC"]],
    });
    if (lastRow) {
        tempNo[model][ymd] = lastRow.no + 1;
    }
}

process();*/
