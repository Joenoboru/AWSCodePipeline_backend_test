import { TDocumentDefinitions } from "pdfmake/interfaces";
import { SalaryItem, StaticSalaryItem } from "../domain-resource/ts-models";
const renderTableHeader = (text: string, options = {}) => ({
    text: text,
    style: "tableHeader",
    alignment: "center",
    ...options,
});

const renderNumber = (number: number, options = {}) => ({
    style: "number",
    text: new Intl.NumberFormat("en-US").format(number),
    alignment: "right",
    ...options,
});

function createSalDoc(
    year: number,
    month: number,
    dtlItem: SalaryItem[],
    logicItem: StaticSalaryItem[],
    dataListRows: any[]
): TDocumentDefinitions {
    /**
     * @type {Array<{type: number, id: number, name: string}>}
     */
    const payItems = [
        ...dtlItem.filter((item) => item.payment_type === 1).map((item) => ({ type: 0, id: item.id, name: item.name })),
        ...logicItem
            .filter((item) => item.payment_type === 1)
            .map((item) => ({ type: 1, id: item.id, name: item.name })),
    ];
    /**
     * @type {Array<{type: number, id: number, name: string}>}
     */
    const deductItems = [
        ...dtlItem.filter((item) => item.payment_type === 2).map((item) => ({ type: 0, id: item.id, name: item.name })),
        ...logicItem
            .filter((item) => item.payment_type === 2)
            .map((item) => ({ type: 1, id: item.id, name: item.name })),
    ];
    const maxRowCount = Math.max(payItems.length, deductItems.length);
    let dataPerPage = Math.floor(34 / (maxRowCount + 6));
    if (dataPerPage < 1) {
        dataPerPage = 1;
    }
    const header = {
        text: `${year}/${Number(month).toString().padStart(2, "0")} 給与明細`,
        style: "header",
    };
    const tablesContents = [];
    const activeRows = dataListRows.filter((row) => "detail" in row && "logic" in row);
    activeRows.forEach((row, i) => {
        const empData = row.Employee;
        const dtlData = [row.detail, row.logic];
        const subTableContents = [
            [renderTableHeader("應付項目", { colSpan: 2 }), "", renderTableHeader("應扣項目", { colSpan: 2 }), ""],
            [
                renderTableHeader("項目"),
                renderTableHeader("金額"),
                renderTableHeader("項目"),
                renderTableHeader("金額"),
            ],
        ];
        for (let i = 0; i < maxRowCount; i++) {
            let mPayRow: any[] = ["", ""];
            let mDedRow: any[] = ["", ""];
            if (i < payItems.length) {
                const mItem = payItems[i];
                const mData = dtlData[mItem.type].find((item) => item.id === mItem.id) as any;
                mPayRow = [mItem.name, renderNumber(mData.amount)];
            }
            if (i < deductItems.length) {
                const mItem = deductItems[i];
                const mData = dtlData[mItem.type].find((item) => item.id === mItem.id);
                mDedRow = [mItem.name, renderNumber(mData.amount)];
            }
            subTableContents.push([...mPayRow, ...mDedRow]);
        }
        tablesContents.push(
            {
                text: `${empData.emp_num}  ${empData.name}`,
                style: "subHeader",
            },
            {
                style: "table",
                table: {
                    widths: [100, "*", 100, "*"],
                    body: [
                        ...subTableContents,
                        [
                            renderTableHeader("合計"),
                            renderNumber(row.mustPay),
                            renderTableHeader("合計"),
                            renderNumber(row.mustDeduct),
                        ],
                        [
                            renderTableHeader("實領金額", { colSpan: 2 }),
                            "",
                            renderNumber(row.totalAmountEmp, { colSpan: 2 }),
                            "",
                        ],
                    ],
                },
            }
        );
        if (i !== activeRows.length - 1) {
            if (i % dataPerPage === dataPerPage - 1) {
                tablesContents.push({ ...header, pageBreak: "before" });
            } else {
                tablesContents.push(
                    "\n",
                    {
                        style: "table",
                        table: {
                            widths: ["*"],
                            body: [[{ text: "", border: [false, false, false, true] }]],
                        },
                    },
                    "\n"
                );
            }
        }
    });

    return {
        watermark: { text: "Future Manager", color: "#006699", opacity: 0.2, bold: true, italics: false },
        content: [header, ...tablesContents],
        footer: (currentPage, pageCount) => ({
            text: `${currentPage} / ${pageCount}`,
            alignment: "right",
            margin: [0, 0, 30, 0],
        }),
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 8],
            },
            subHeader: {
                fontSize: 14,
                bold: true,
                margin: [0, 0, 0, 5],
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: "black",
            },
            table: {
                margin: [0, 0, 0, 0],
            },
            number: {
                margin: [0, 0, 5, 0],
            },
        },
    };
}

export default createSalDoc;
