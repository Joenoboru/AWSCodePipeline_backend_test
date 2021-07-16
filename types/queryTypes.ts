import { Query } from "express-serve-static-core";

export type QueryListResult<T> = {
    count: number;
    rows: T[];
};

export type AnyObj = Record<string, unknown>;

export type FilterType = {
    f: string;
    v: string | string[];
};

export type StandardResponse = {
    status: string;
    code: string;
    result: any;
};

export type TempNoObj = {
    [key: string]: TempNoUnit;
};

export type TempNoUnit = {
    [key: string]: number;
};

export interface ListQueryParams extends Query {
    order?: string;
    orderDir?: string;
    str?: string;
    filter?: string[];
    limit?: string;
}

export interface ResponseHandler<ResultType = any> {
    status: string;
    error?: any;
    result?: ResultType;
}

export interface ErrorHandler extends ResponseHandler {
    code: string;
}

export interface StdQueryListResult<M> {
    count: number;
    data: M[];
    maxpage?: number;
}
