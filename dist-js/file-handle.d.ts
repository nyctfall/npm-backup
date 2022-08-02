/// <reference types="node" />
/// <reference types="node" />
import { Dir, PathLike } from "fs";
export { chdir, cwd } from "process";
/**
 * @debrief - This module is a namespace for all of the file handling functions, classes,
 *  and TS interfaces, types and enums. It uses the FSPromise API version.
 *
 * // This module facilitates this for file access.
 * // From NPM Docs:
 * In cases where you need to preserve npm packages locally or have them available through a single file download, you can bundle the packages in a tarball file by specifying the package names in the bundledDependencies array and executing `npm pack`.
 *
 * // Compatiblity note:
 * If this is spelled "bundleDependencies", then that is also honored.
 *
 * // MVP - M.inimum V.iable P.roduct:
 * @goal1 - read NPM pkg file: "package.json".
 * @goal2 - read package.json fields: "dependencies", "devDependencies", "peerDependencies", "optionalDependencies", and "bundle(d)Dependencies".
 * @goal3 - write to package.json field: "bundle(d)Dependencies".
 * @goal4 - make tmp dir for install npm pkgs.
 * @goal5 - move pkg dirs from tmp dir to install dir.
 * @goal6 - delete tmp install dir after pkg dir move.
 *
 * @todo:
 * // @goalX - Digest file, it lists every pkg backed up and lists every variety of dependancy installed.
 * // @goalX - SHA2/SHA3 checksums file, to ensure integrity of pkg backup files.
 */
/**
 * @TODO
 */
export interface NPMPackageJSON {
    version: string;
    dependencies: string[];
    devDependencies: string[];
    peerDependencies: string[];
    optionalDependencies: string[];
    bundleDependencies?: string[];
    bundledDependencies?: string[];
}
export declare type FSPath = PathLike & string;
export declare const PackageJSON: string;
export declare const PackageJSONEncodingFormat: string & BufferEncoding;
export declare const readPkgJSON: (containingDirPath: FSPath) => Promise<NPMPackageJSON>;
export declare const writePkgJSON: (containingDirPath: FSPath, newPkgJSON: NPMPackageJSON, signal?: AbortSignal) => Promise<void>;
export declare const makeTmpDir: (prefix?: FSPath) => Promise<FSPath>;
export declare const moveToDir: (file: FSPath, dest: FSPath) => Promise<void>;
export declare const makeDir: (dirName: FSPath) => Promise<Dir>;
export declare const removeDir: (dirName: FSPath) => Promise<void>;
export declare const removePath: (dirName: FSPath) => Promise<void>;
