const fs = require("fs");
const { exec } = require("child_process");

// const apiFolderPath = "./src/app/api";
const fileName = "./api.client.ts";

// Function to read environment variables from .env or .env.local file
function readEnvironmentVariables(filename) {
    // Check if the file exists
    if (fs.existsSync(filename)) {
        // Read the contents of the file
        const envData = fs.readFileSync(filename, "utf8");
        // Parse the contents into an object
        return envData.split("\n").reduce((acc, curr) => {
            const [key, value] = curr.split("=");
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});
    } else {
        // If the file does not exist, return an empty object
        return {};
    }
}

// // Check if the api folder exists, if not, create it
// if (!fs.existsSync(apiFolderPath)) {
//     fs.mkdirSync(apiFolderPath);
// }

// Check if the api.ts file exists, delete it
if (fs.existsSync(fileName)) {
    fs.unlinkSync(fileName);
}

// Read environment variables from .env.local or .env
const envLocalObj = readEnvironmentVariables(".env.local");
const envObj = readEnvironmentVariables(".env");

// Merge environment variables from .env.local and .env
const mergedEnv = { ...envObj, ...envLocalObj };

// Check if the VITE_API_URL environment variable exists
if (!mergedEnv.VITE_API_URL) {
    console.error("The VITE_API_URL environment variable is not defined. Please define it in .env.local or .env.");
    return;
}

// Split VITE_API_URL into an array of URLs
const apiUrls = String(mergedEnv.VITE_API_URL).trim().split(",");

// Configuration for NSwag
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

// Generate API clients for each URL
apiUrls.forEach((apiUrl, index) => {
    // Parse the URL
    const apiEndpoint = new URL(apiUrl.replace(/"/g, ""));
    console.log(`Generating API client for ${apiEndpoint.hostname}`);

    // Define the output file name based on the hostname
    const fileOutputName = `${apiEndpoint.hostname.trim().split(".")[0]}.api.ts`;

    // Construct NSwag command
    const nswagCommand = Object.entries(config).reduce(
        (acc, [key, value]) => {
            acc += `/${key}:${value} `;
            return acc;
        },
        `.\\node_modules\\.bin\\nswag openapi2tsclient /input:${apiEndpoint.protocol}//${apiEndpoint.hostname}${
            apiEndpoint.port ? ":" + apiEndpoint.port : ""
        }/swagger/v1/swagger.json /output:${apiFolderPath}/${fileOutputName} `
    );

    // Execute NSwag command
    exec(nswagCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`NSwag NPM CLI error: ${error}`);
            return;
        }
        console.log(`NSwag NPM CLI stdout: ${stdout}`);
        console.error(`NSwag NPM CLI stderr: ${stderr}`);
    }).on("close", (code) => {
        // Post-processing: replace /api/ with / in the generated API client
        fs.readFile(`${apiFolderPath}/${fileOutputName}`, "utf8", (err, data) => {
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
            fs.writeFile(`${apiFolderPath}/${fileOutputName}`, result, "utf8", (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });
    });
});

