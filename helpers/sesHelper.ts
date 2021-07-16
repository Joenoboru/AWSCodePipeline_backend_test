import AWS from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

export function createSampleParams(toAddresses: AWS.SES.AddressList, subject: AWS.SES.MessageData, contents?: AWS.SES.MessageData, type?: "text" | "html"): AWS.SES.Types.SendEmailRequest {
    const Body: AWS.SES.Body = {};
    const mContents: AWS.SES.Content = {
        Charset: "UTF-8",
        Data: contents,
    };
    if (type && type === "text") {
        Body.Text = mContents;
    } else {
        Body.Html = mContents;
    }
    return {
        Destination: {
            ToAddresses: toAddresses,
        },
        Source: "fm@ses.mirai-network.com", // sender email
        //SourceArn: "",
        Message: {
            Body,
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        //ReplyToAddresses: [
        //],
        //ReturnPath: "",
        //ReturnPathArn: "",
    };
}

export function sendMail(params: AWS.SES.Types.SendEmailRequest): Promise<PromiseResult<AWS.SES.Types.SendEmailResponse, AWS.AWSError>> {
    return new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
}

export function sendSampleMail(
    toAddresses: AWS.SES.AddressList,
    subject: AWS.SES.MessageData,
    contents?: AWS.SES.MessageData,
    type?: "text" | "html"
): Promise<PromiseResult<AWS.SES.Types.SendEmailResponse, AWS.AWSError>> {
    if (!process.env.AWS_ACCESS_KEY_ID) {
        return;
    }
    return sendMail(createSampleParams(toAddresses, subject, contents, type));
}
