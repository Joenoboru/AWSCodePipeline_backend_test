import { I18NextRequest } from "i18next-http-middleware";
import { StandardUser } from "./types";
//import { Req } from "passport";

export {};

declare global {
    namespace Express {
        interface User extends StandardUser {}

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Request extends I18NextRequest {}
    }
    namespace session {
        interface SessionData {}
    }
}

declare module "express-session" {
    export interface SessionData {
        passport: {
            user: StandardUser;
        };
    }
}
