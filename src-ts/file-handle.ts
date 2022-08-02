import { BaseEncodingOptions, Dir, PathLike } from "fs"
import { tmpdir } from "os"
import { mkdtemp, mkdir, readFile, writeFile, opendir, rm/* rename, open, rmdir, stat, FileHandle */} from "fs/promises"
import { move } from "fs-extra"
import { /* PlatformPath, */ posix as path } from "path"
export { chdir, cwd } from "process"
const { basename, join } = path

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
// type NumChar = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
// type NumStr = `${NumChar}`
// type VerStr = `${NumStr}.${NumStr}.${NumStr}`
// type SemVer = `^${VerStr}` | `~${VerStr}`
// interface NPMPackageToSemVer {}
export interface NPMPackageJSON {
  version: string // SemVer
  dependencies: string[]
  devDependencies: string[]
  peerDependencies: string[]
  optionalDependencies: string[]
  bundleDependencies?: string[]
  bundledDependencies?: string[]
}

export type FSPath = PathLike & string
export const PackageJSON: string = "package.json"
export const PackageJSONEncodingFormat: string & BufferEncoding = "utf8"

// read the package.json on the pkg dir:
export const readPkgJSON = async (containingDirPath: FSPath): Promise<NPMPackageJSON> => {
  // create the path to the package.json:
  const path = join(containingDirPath, PackageJSON)
  
  // read the package.json:
  const file = await readFile(path, PackageJSONEncodingFormat)
  
  // make the JSON text file an object:
  return JSON.parse(file)
}

// write an object to the JSON text package.json file:
export const writePkgJSON = async (containingDirPath: FSPath, newPkgJSON: NPMPackageJSON, signal?: AbortSignal) => {
  // create the path to the package.json:
  const path = join(containingDirPath, PackageJSON)
  
  // convert the JSON object into JSON text:
  const file = JSON.stringify(newPkgJSON, undefined, 2)
  
  // write JSON text to the package.json:
  return await writeFile(path, file, {
    encoding: PackageJSONEncodingFormat,
    signal
  } as BaseEncodingOptions)
}

export const makeTmpDir = async (prefix: FSPath = "tmp-install-dir-"): Promise<FSPath> => await mkdtemp(join(tmpdir(), prefix))

export const moveToDir = async (file: FSPath, dest: FSPath) => await move(file, join(dest, basename(file)))

export const makeDir = async (dirName: FSPath): Promise<Dir> => {
  await mkdir(dirName, 0o755)
  return await opendir(dirName, { encoding: PackageJSONEncodingFormat })
}

export const removeDir = async (dirName: FSPath) => await rm(dirName, { recursive: true })

export const removePath = async (dirName: FSPath) => await rm(dirName, { recursive: true })

