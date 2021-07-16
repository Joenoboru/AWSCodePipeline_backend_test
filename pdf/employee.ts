import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Employee } from "../domain-resource/ts-models";

function createEmpDoc(row: Employee): TDocumentDefinitions {
    return {
        watermark: { text: "Future Manager", color: "#006699", opacity: 0.2, bold: true, italics: false },
        content: [
            {
                text: "社員台帳",
                style: "header",
            },
            `No.${row.emp_num}`,
            {
                style: "table",
                table: {
                    widths: [100, "*", 100, "*"],
                    body: [
                        [
                            { text: "氏名", style: "tableHeader" },
                            row.name,
                            { colSpan: 2, text: "", border: [false, false, false, false] },
                        ],
                        [
                            { text: "英語名", style: "tableHeader" },
                            row.engname,
                            { colSpan: 2, text: "", border: [false, false, false, false] },
                        ],
                        [
                            { text: "Eメール", style: "tableHeader" },
                            row.email,
                            { colSpan: 2, text: "", border: [false, false, false, false] },
                        ],
                        [
                            { text: "國籍", style: "tableHeader" },
                            row.nationality,
                            { colSpan: 2, text: "", border: [false, false, false, false] },
                        ],
                    ],
                },
            },
            {
                style: "middleTale",
                table: {
                    widths: [100, "*", 100, "*"],
                    body: [
                        [
                            { text: "生年月日", style: "tableHeader" },
                            row.birthday,
                            { text: "性別", style: "tableHeader" },
                            ["", "男", "女"][row.sex],
                        ],
                        [
                            { text: "戶籍住所", style: "tableHeader" },
                            { colSpan: 3, text: row.reg_addr },
                        ],
                        [
                            { text: "連絡住所", style: "tableHeader" },
                            { colSpan: 3, text: row.con_addr },
                        ],
                        [
                            { text: "電話", style: "tableHeader" },
                            row.tel,
                            { text: "携帯", style: "tableHeader" },
                            row.mobile,
                        ],
                    ],
                },
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 5],
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: "black",
            },
            table: {
                margin: [0, 5, 0, 0],
            },
            middleTale: {
                margin: [0, -1, 0, 0],
            },
        },
    };
}

export default createEmpDoc;
