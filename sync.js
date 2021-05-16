"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const app = new koa_1.default();
app.use(async (ctx, next) => {
    let parsedPath = path_1.default.parse(decodeURIComponent(ctx.URL.pathname));
    console.log(parsedPath);
    if (parsedPath.dir == "/@api") {
        next();
        return;
    }
    if (parsedPath.dir == "/@browse") {
        next();
        return;
    }
    let rpath = path_1.default.join("./mirrors/" + decodeURIComponent(ctx.URL.pathname));
    let realPath = path_1.default.parse(path_1.default.join("./mirrors/" + decodeURIComponent(ctx.URL.pathname)));
    if (fs_extra_1.default.existsSync(rpath) && (realPath.ext != '' || ctx.URL.searchParams.get("type") == "file")) {
        ctx.status = 200;
        let stream = fs_extra_1.default.createReadStream(rpath);
        ctx.body = stream;
    }
    else if (fs_extra_1.default.pathExistsSync(rpath), (realPath.ext == '' || ctx.URL.searchParams.get("type") == "folder")) {
        ctx.status = 403;
        ctx.body = {
            status: 403,
            msg: "this is a folder"
        };
    }
    else {
        ctx.status = 404;
        ctx.body = {
            status: 404,
            msg: "not found"
        };
    }
});
app.use(async (ctx, next) => {
    let parsedPath = path_1.default.parse(decodeURIComponent(ctx.URL.pathname));
    console.log(parsedPath);
    if (parsedPath.dir == "/@browse") {
        next();
        return;
    }
    if (parsedPath.dir == "/@api") {
        switch (parsedPath.base) {
            case "dir":
                let realPath = path_1.default.join("./mirrors/" + decodeURIComponent(ctx.URL.searchParams.get("path") ?? "./"));
                if (fs_extra_1.default.pathExistsSync(realPath)) {
                    let realPath_ = path_1.default.parse(realPath);
                    console.log(realPath_);
                    let a;
                    if (realPath_.ext == '') {
                        a = fs_extra_1.default.readdirSync(realPath, {
                            encoding: "utf8",
                            withFileTypes: true
                        });
                    }
                    else {
                        a = [{
                                name: realPath_.name + realPath_.ext,
                                __o: fs_extra_1.default.statSync(realPath),
                            }];
                    }
                    console.log(a);
                    ctx.body = JSON.stringify({
                        status: 200,
                        data: a.map(v => {
                            let stat;
                            if (v.__o) {
                                stat = v.__o;
                                v.isFile = () => v.__o.isFile();
                                v.isDirectory = () => v.__o.isDirectory();
                            }
                            else {
                                stat = fs_extra_1.default.statSync(path_1.default.join(realPath, v.name));
                            }
                            console.log(v);
                            return {
                                name: v.name,
                                isFile: v.isFile(),
                                isDir: v.isDirectory(),
                                size: stat.size,
                                atime: stat.atimeMs,
                                btime: stat.birthtimeMs,
                                blocks: stat.blocks,
                                blksize: stat.blksize,
                                __url: (() => {
                                    if (v.__o) {
                                        return new URL(ctx.URL.origin + "/" + decodeURIComponent(ctx.URL.searchParams.get("path") ?? "")).toString();
                                    }
                                    else {
                                        return new URL(ctx.URL.origin + decodeURIComponent(ctx.URL.searchParams.get("path") ?? "") + v.name).toString();
                                    }
                                })()
                            };
                        })
                    });
                }
                else {
                    ctx.body = {
                        status: 404,
                        data: null
                    };
                }
                break;
            case "underline_indexes":
                let root = fs_extra_1.default.readdirSync("./mirrors/插件包", {
                    encoding: "utf8",
                    withFileTypes: true
                });
                let out = new Set();
                for (const f of root) {
                    console.log(f);
                    let ff = fs_extra_1.default.readdirSync(path_1.default.join("./mirrors/插件包/", f.name), {
                        encoding: "utf8",
                        withFileTypes: true
                    });
                    for (const fff of ff.filter(v => v.isFile() && path_1.default.parse(v.name).ext == ".7z" && path_1.default.parse(v.name).name.split("_").length == 3)) {
                        out.add(path_1.default.parse(fff.name).name + "_" + f.name);
                    }
                }
                ctx.type = "text/plain";
                ctx.body = Array.from(out).join("\r\n");
        }
    }
});
const config = fs_extra_1.default.readJSONSync("./config.json");
const server = app.listen(config.port, () => console.log(server));
