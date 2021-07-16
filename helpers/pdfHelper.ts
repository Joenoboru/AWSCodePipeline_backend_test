import Pdfmake from "pdfmake";
import { TDocumentDefinitions, BufferOptions } from "pdfmake/interfaces";
// Define font files
const fonts = {
    Roboto: {
        normal: "fonts/SourceHanSansJP-Regular.ttf",
        bold: "fonts/SourceHanSansJP-Bold.ttf",
        italics: "fonts/SourceHanSansJP-Regular.ttf",
        bolditalics: "fonts/SourceHanSansJP-Bold.ttf",
    },
};

export function exportPDF(docDefinition: TDocumentDefinitions, callback: (any) => void, options?: BufferOptions): any {
    const printer = new Pdfmake(fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    const chunks = [];
    let result;
    pdfDoc.on("data", function (chunk) {
        chunks.push(chunk);
    });
    pdfDoc.on("end", function () {
        result = Buffer.concat(chunks);
        callback(result);
        //callback("data:application/pdf;base64," + result.toString("base64"));
    });
    pdfDoc.end();
}
