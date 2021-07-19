import { config } from "dotenv";
import getDomainFromArgv from "./getDomainFromArgv";
import "module-alias/register";
import getDomainDatabase, { DomainResource } from "@/domain-resource";

async function loadDomainDatabaseForConsole(): Promise<DomainResource> {
    config();
    const domain = await getDomainFromArgv();
    return getDomainDatabase(domain);
}

export default loadDomainDatabaseForConsole;
