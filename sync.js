"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
let pp = "https://zfile.edgeless.top/api/list/2?path=";
if (!fs_extra_1.default.pathExistsSync("./mirrors"))
    fs_extra_1.default.mkdirSync("./mirrors");
async function er(e) {
    if (e.type == "FILE") {
        if (!fs_extra_1.default.pathExistsSync(`./mirrors/${e.path}`))
            fs_extra_1.default.mkdirSync(`./mirrors/${e.path}`);
        new worker_threads_1.Worker(__filename, {
            workerData: ["", e]
        });
    }
    else if (e.type == "FOLDER") {
        if (!fs_extra_1.default.pathExistsSync("./mirrors/" + e.path + e.name))
            fs_extra_1.default.mkdirSync("./mirrors/" + e.path + e.name);
        await Sleep(1000);
        let indexe = await axios_1.default.get(pp + encodeURIComponent(e.path + e.name));
        if (indexe.data.code != 0)
            throw "Err";
        let cure = indexe.data.data.files;
        cure.forEach(er);
    }
}
(async () => {
    if (worker_threads_1.isMainThread) {
        //https://zfile.edgeless.top/api/list/2?path=%2F&password=&orderBy=&orderDirection=
        let index = await axios_1.default.get(pp + encodeURIComponent("/"), {
            headers: {
                referer: "https://zfile.edgeless.top/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36 Edg/90.0.818.62"
            }
        });
        //console.log(pp+encodeURIComponent("/"), );
        //fs.writeFile("./out.txt", JSON.stringify(index.data, null, 4));
        if (index.data.code != 0)
            throw "Err";
        let cont = index.data.data.files;
        cont.forEach(er);
    }
    else {
        const data = worker_threads_1.workerData;
        worker(data[0], data[1]);
    }
})();
async function worker(cur, uu) {
    if (!fs_extra_1.default.pathExistsSync(`./mirrors/${uu.path}`))
        fs_extra_1.default.mkdirSync(`./mirrors/${uu.path}`);
    console.log("worker", uu, "start");
    console.log(!fs_extra_1.default.pathExistsSync(`./mirrors/${uu.path}`));
    let ccc;
    try {
        ccc = await axios_1.default.get(encodeURI(uu.url), {
            responseType: 'stream'
        });
    }
    catch { }
    ;
    let ccd = ccc.data;
    let length = Math.max();
    if (ccd.headers['content-length'] != undefined) {
        length = parseInt(ccd.headers['content-length'], 10);
    }
    ;
    let ate = 0;
    console.log("worker", "Current: ", uu);
    console.log("worker", "Length: ", length);
    let stream = fs_extra_1.default.createWriteStream(path_1.default.resolve('./mirrors', uu.path, uu.name));
    ccd.on("data", (chunk) => {
        ate += chunk.length;
        stream.write(chunk);
        console.log("worker", uu.name, ", ", (ate / 1024 / 1024).toFixed(2), "/", (length / 1024 / 1024).toFixed(2), "MiB, Speed: ", (chunk.length / 1024 / 1024).toFixed(2), "MiB/chunk");
    });
    await (new Promise(r => ccd.on("close", r)));
    stream.close();
    console.log(uu.name, "ok");
}
exports.worker = worker;
function Sleep(ms) {
    return new Promise(r => {
        setTimeout(r, ms);
    });
}
