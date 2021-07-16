import { StandardResponse, FilterType, AnyObj, QueryListResult, TempNoObj, TempNoUnit } from "./queryTypes";
export type NextStageAuditor = {
    routeDetailCount: number;
    auditorId: number | null;
};

interface StandardUser {
    employeeId: number;
    domain: string;
    name: string;
    picture: string;
    email: string;
    UsePermission: {
        logo: string;
        name: string;
        id: number;
    };
    strategy: string;
}

export { StandardResponse, FilterType, AnyObj, QueryListResult, TempNoObj, TempNoUnit, StandardUser };
