import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import "module-alias/register";
import { Page } from "@/common-database/ts-models";
import BaseService from "../BaseService";

//import sequelize from "sequelize";

class FileService extends BaseService {
    static BASE_FILE_PATH = "files";
    static TEMP_FILE_PATH = "temp";
    protected req: Request;
    constructor(req: Request) {
        super(req);
    }

    public async uploadTempFile(): Promise<FileData[]> {
        const tempFilePath = FileService.TEMP_FILE_PATH;
        const fileData = await this.doUploadFile(tempFilePath);
        return fileData;
    }

    private async doUploadFile(pathName: string): Promise<FileData[]> {
        const list: FileData[] = [];
        const baseFilePath = this.getBaseFilePath();
        const fullFilePath = `${baseFilePath}/${pathName}`;
        try {
            if (!fs.existsSync(fullFilePath)) {
                fs.mkdirSync(fullFilePath, { recursive: true });
            }
            if (this.req.files) {
                const files = this.req.files.file;
                const processMethod = async (file: UploadedFile) => {
                    const newFilename = `${uuidv4()}`;
                    const path = `${pathName}/${newFilename}`;
                    await file.mv(`${baseFilePath}/${path}`);
                    list.push({
                        title: file.name,
                        path: path,
                        size: file.size,
                    });
                };
                if (Array.isArray(files)) {
                    for (const key in files) {
                        await processMethod(files[key]);
                    }
                } else {
                    await processMethod(files);
                }
            }
        } catch (e) {
            this.logger.error(e);
        }
        console.log(list);
        return list;
    }

    public async processAttachFile(page: string, dataId: number | string, files: FileData[]): Promise<FileData[]> {
        const baseFilePath = this.getBaseFilePath();
        const tempFilePathName = FileService.TEMP_FILE_PATH;
        const dataFilePathName = `${page}/${dataId}`;
        const fullPath = `${baseFilePath}/${dataFilePathName}`;
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        const originalFiles: FileData[] = files.filter((a) => a.path.indexOf(`${dataFilePathName}/`) >= 0);
        const tampFiles: FileData[] = files
            .filter((a) => a.path.indexOf(`${tempFilePathName}/`) >= 0)
            .map((fileData) => {
                const oldPath = fileData.path;
                const newPath = oldPath.replace(tempFilePathName, dataFilePathName);
                fs.rename(`${baseFilePath}/${oldPath}`, `${baseFilePath}/${newPath}`, (err) => {
                    if (err) {
                        this.logger.error(err);
                    }
                });
                return {
                    ...fileData,
                    path: newPath,
                };
            });
        return [...originalFiles, ...tampFiles];
    }

    public async processAuditFile(
        page: string,
        dataId: number | string,
        auditId: number | string,
        files: FileData[]
    ): Promise<FileData[]> {
        const baseFilePath = this.getBaseFilePath();
        const auditFilePathName = `audit/${auditId}`;
        const dataFilePathName = `${page}/${dataId}`;
        const fullPath = `${baseFilePath}/${dataFilePathName}`;
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        const mFiles: FileData[] = files
            .filter((a) => a.path.indexOf(`${auditFilePathName}/`) >= 0)
            .map((fileData) => {
                const oldPath = fileData.path;
                const newPath = oldPath.replace(auditFilePathName, dataFilePathName);
                fs.copyFileSync(`${baseFilePath}/${oldPath}`, `${baseFilePath}/${newPath}`);
                return {
                    ...fileData,
                    path: newPath,
                };
            });
        return mFiles;
    }

    public async uploadFile(res: Response, page: string, dataId: number | string): Promise<FileData[]> {
        const permission = await this.getPagePermission(page);
        if (!permission) {
            res.status(404).send();
            return [];
        } else {
            const path = `${page}/${dataId}`;
            const fileData = await this.doUploadFile(path);
            return fileData;
        }
    }

    private async getPagePermission(page: string): Promise<boolean> {
        let pagePerm = false;
        const empPermList = await this.getCurrentUserRoles();
        const pageData = await Page.findOne({
            attributes: ["id", "name", "resource"],
            where: {
                name: page,
            },
        });
        if (pageData && pageData.resource && pageData.resource.length > 0) {
            const intersection = pageData.resource.filter((value) => empPermList.includes(value));
            pagePerm = intersection.length > 0;
        }
        return pagePerm;
    }

    async deleteFiles(page: string, fileList: FileData[]): Promise<boolean> {
        const permission = await this.getPagePermission(page);
        if (!permission) {
            return false;
        }
        const baseFilePath = this.getBaseFilePath();
        fileList.forEach((fileData) => {
            const fileFullPath = `${baseFilePath}/${fileData.path}`;
            if (fs.existsSync(fileFullPath)) {
                fs.unlinkSync(`${baseFilePath}/${fileData.path}`);
            }
        });
        return true;
    }

    async downloadFile(
        res: Response,
        page: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
        model: any,
        dataId: string,
        index: number,
        field = "attachFiles"
    ): Promise<void> {
        const permission = await this.getPagePermission(page);
        if (!permission) {
            res.status(404).send();
        } else {
            const mainData = await model.findOne({
                attributes: ["id", field],
                where: { id: dataId },
            });
            if (!mainData || !mainData[field]) {
                res.status(404).send();
            }
            if (index >= mainData[field].length) {
                res.status(404).send();
            } else {
                const baseFilePath = this.getBaseFilePath();
                const fileData = mainData[field][index];
                res.download(`${baseFilePath}/${fileData.path}`, fileData.title);
            }
        }
    }

    getBaseFilePath = (): string => `./${FileService.BASE_FILE_PATH}/${this.domain}`;
}

export default FileService;

export interface FileData {
    title: string;
    path: string;
    size?: number;
}
