require('dotenv').config();
const execSync = require('child_process').execSync;
const commonDB = require("./common-database")
const { UsePermission } = commonDB;
UsePermission.findAll({}).then(results => {
    // console.log(results);
    const {
        DB_HOST,
        DB_PORT,
        DB_USER,
        DB_PASSWORD,
    } = process.env;
    results.forEach(permission => {
        try {
            const command = `npx sequelize-cli db:migrate --url 'mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${permission.domain}'`;
            console.log(command)
            const code = execSync(command)
            console.log(code);
        } catch (e) {
            console.error(e)
        }
    })

})