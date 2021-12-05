"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePath = exports.removeDir = exports.makeDir = exports.moveToDir = exports.makeTmpDir = exports.writePkgJSON = exports.readPkgJSON = void 0;
const os_1 = require("os");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const { basename, join } = path_1.posix;
const PackageJSON = "package.json";
const PackageJSONEncodingFormat = "utf8";
const readPkgJSON = async (containingDirPath) => {
    return JSON.parse(await (0, promises_1.readFile)(join(containingDirPath, PackageJSON), PackageJSONEncodingFormat));
};
exports.readPkgJSON = readPkgJSON;
const writePkgJSON = async (containingDirPath, newPkgJSON, signal) => {
    return await (0, promises_1.writeFile)(containingDirPath, JSON.stringify(newPkgJSON), {
        encoding: PackageJSONEncodingFormat,
        signal
    });
};
exports.writePkgJSON = writePkgJSON;
const makeTmpDir = async (prefix = "tmp-install-dir-") => {
    return await (0, promises_1.mkdtemp)(join((0, os_1.tmpdir)(), prefix));
};
exports.makeTmpDir = makeTmpDir;
const moveToDir = async (file, dest) => {
    return await (0, promises_1.rename)(file, join(dest, basename(file)));
};
exports.moveToDir = moveToDir;
const makeDir = async (dirName) => {
    await (0, promises_1.mkdir)(dirName, 0o755);
    return await (0, promises_1.opendir)(dirName, { encoding: PackageJSONEncodingFormat });
};
exports.makeDir = makeDir;
const removeDir = async (dirName) => {
    return await (0, promises_1.rmdir)(dirName, { recursive: true });
};
exports.removeDir = removeDir;
const removePath = async (dirName) => {
    return await (0, promises_1.rm)(dirName, { recursive: true });
};
exports.removePath = removePath;
