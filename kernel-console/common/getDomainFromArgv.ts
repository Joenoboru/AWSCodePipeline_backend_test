import { createInterface } from "readline";
import { config } from "dotenv";

function getDomainFromArgv(): Promise<string> {
    return new Promise((resolve) => {
        const myArgv = process.argv.slice(2);
        if (myArgv.length > 0) {
            resolve(myArgv[0]);
        } else {
            const readline = createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            readline.question("Please enter domain:", (arg) => {
                resolve(arg);
                readline.close();
            });
        }
        return null;
    });
}

export default getDomainFromArgv;
