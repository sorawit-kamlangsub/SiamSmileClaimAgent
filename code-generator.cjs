const fs = require("fs");
const { exec } = require("child_process");
const fileName = "./api.client.ts";

if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
}

if (!fs.existsSync(".env.local")) {
    console.error(
        "The .env.local file does not exist. Please create it and add the VITE_API_URL environment variable."
    );
    return;
}

const envLocal = fs.readFileSync(".env.local", "utf8");

const envLocalObj = envLocal.split("\n").reduce((acc, curr) => {
    const [key, value] = curr.split("=");
    if (key && value) {
        acc[key.trim()] = value.trim();
    }
    return acc;
}, {});

const config = {
    template: "Axios",
    dateTimeType: "DayJS",
    operationGenerationMode: "MultipleClientsFromFirstTagAndOperationId",
    generateOptionalParameters: "true",
    generateClientClasses: "true",
    clientBaseClass: "",
    typeStyle: "Interface",
    enumStyle: "StringLiteral",
};

let apiEndpoint = new URL(envLocalObj.VITE_API_URL.replace(/"/g, ""));

console.log(`Generating API client for ${apiEndpoint.hostname}`);

const nswagCommand = Array.from(Object.entries(config)).reduce(
    (acc, curr) => {
        const [key, value] = curr;
        acc += `/${key}:${value} `;
        return acc;
    },
    `.\\node_modules\\.bin\\nswag openapi2tsclient /input:${apiEndpoint.protocol}//${apiEndpoint.hostname}${
        apiEndpoint.port ? ":" + apiEndpoint.port : ""
    }/swagger/v1/swagger.json ` + `/output:${fileName} `
);

console.log(`NSwag NPM CLI command: ${nswagCommand}`);

exec(nswagCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`NSwag NPM CLI error: ${error}`);
        return;
    }
    console.log(stdout);

    if (stderr) console.error(stderr);
}).on("close", (code) => {
    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const result = data
            .replace(/\/api\//g, "/")
            .replace(/result200 = JSON.parse\(resultData200\)/g, "result200 = resultData200")
            .replace(
                /const content_ = JSON.stringify\(body\)/g,
                "const content_ = JSON.stringify(body, customFormatter)"
            )
            .replace(/.toISOString\(\)/g, ".format('YYYY-MM-DDTHH:mm:ss')")
            .replace(
                /import axios/g,
                'import { customFormatter } from "../modules/_common/commonFunctions";\nimport axios'
            );

        fs.writeFile(fileName, result, "utf8", (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
});
