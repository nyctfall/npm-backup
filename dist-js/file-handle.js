"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePath = exports.removeDir = exports.makeDir = exports.moveToDir = exports.makeTmpDir = exports.writePkgJSON = exports.readPkgJSON = exports.PackageJSONEncodingFormat = exports.PackageJSON = exports.cwd = exports.chdir = void 0;
const os_1 = require("os");
const promises_1 = require("fs/promises");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
var process_1 = require("process");
Object.defineProperty(exports, "chdir", { enumerable: true, get: function () { return process_1.chdir; } });
Object.defineProperty(exports, "cwd", { enumerable: true, get: function () { return process_1.cwd; } });
const { basename, join } = path_1.posix;
exports.PackageJSON = "package.json";
exports.PackageJSONEncodingFormat = "utf8";
// read the package.json on the pkg dir:
const readPkgJSON = async (containingDirPath) => {
    // create the path to the package.json:
    const path = join(containingDirPath, exports.PackageJSON);
    // read the package.json:
    const file = await (0, promises_1.readFile)(path, exports.PackageJSONEncodingFormat);
    // make the JSON text file an object:
    return JSON.parse(file);
};
exports.readPkgJSON = readPkgJSON;
// write an object to the JSON text package.json file:
const writePkgJSON = async (containingDirPath, newPkgJSON, signal) => {
    // create the path to the package.json:
    const path = join(containingDirPath, exports.PackageJSON);
    // convert the JSON object into JSON text:
    const file = JSON.stringify(newPkgJSON, undefined, 2);
    // write JSON text to the package.json:
    return await (0, promises_1.writeFile)(path, file, {
        encoding: exports.PackageJSONEncodingFormat,
        signal
    });
};
exports.writePkgJSON = writePkgJSON;
const makeTmpDir = async (prefix = "tmp-install-dir-") => await (0, promises_1.mkdtemp)(join((0, os_1.tmpdir)(), prefix));
exports.makeTmpDir = makeTmpDir;
const moveToDir = async (file, dest) => await (0, fs_extra_1.move)(file, join(dest, basename(file)));
exports.moveToDir = moveToDir;
const makeDir = async (dirName) => {
    await (0, promises_1.mkdir)(dirName, 0o755);
    return await (0, promises_1.opendir)(dirName, { encoding: exports.PackageJSONEncodingFormat });
};
exports.makeDir = makeDir;
const removeDir = async (dirName) => await (0, promises_1.rm)(dirName, { recursive: true });
exports.removeDir = removeDir;
const removePath = async (dirName) => await (0, promises_1.rm)(dirName, { recursive: true });
exports.removePath = removePath;
//# sourceMappingURL=file-handle.js.map