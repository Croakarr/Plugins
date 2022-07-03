const fs = require("fs");
const crypto = require("crypto");

console.log("\x1b[32m[LOG]\x1b[0m - Attempting to bundle plugin.")
console.log("\x1b[32m[DBG]\x1b[0m - Current Directory: ", process.cwd());

if (fs.existsSync(`${process.cwd()}/croakerr-manifest.json`)) {
    console.log("\x1b[32m[DBG]\x1b[0m - Validating manifest.")
    let rawManifest = fs.readFileSync(`${process.cwd()}/croakerr-manifest.json`, "utf8");
    let manifest;
    try {
        manifest = JSON.parse(rawManifest);
    } catch (e) {
        console.error("\x1b[31m[ERR]\x1b[0m - Unable to create bundle.")
        console.error("\x1b[31m[ERR]\x1b[0m - Failed to read.")
        console.error(e);
        process.exit();
    }
    bundleFile(manifest);
} else {
    console.error("\x1b[31m[ERR]\x1b[0m - Unable to create bundle.")
    console.error("\x1b[31m[ERR]\x1b[0m - Missing manifest file.")
}


function bundleFile(manifest) {
    let { entrypoint } = manifest;

    let plugin = fs.readFileSync(entrypoint, 'utf8');

    let encodedManifest = encode(JSON.stringify(manifest));
    let encodedPlugin = encode(plugin);

    let final = `${encodedManifest};${encodedPlugin};${buildHash(encodedManifest)};${buildHash(encodedPlugin)}`;

    fs.writeFileSync(`${process.cwd()}/${manifest.name}.croakerr`, final);
    console.log(`\n\nbundle:${manifest.name}.croakerr`)
}

function encode(data) {
    return Buffer.from(data).toString("base64");
}

function buildHash(content) {
    return crypto.createHash('md5').update('some_string').digest("hex");
}