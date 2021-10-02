import { BaseEncodingOptions, Dir, PathLike } from "fs"
import { tmpdir } from "os"
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rename,
  open,
  opendir,
  rm,
  rmdir,
  stat,
  FileHandle
} from "fs/promises"
import { PlatformPath, posix as path } from "path"
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
type NumChar = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
type NumStr = `${NumChar}`
type VerStr = `${NumStr}.${NumStr}.${NumStr}`
type SemVer = `^${VerStr}` | `~${VerStr}`
interface NPMPackageToSemVer {}
interface NPMPackageJSON {
  version: SemVer
  dependencies: string[]
  devDependencies: string[]
  peerDependencies: string[]
  optionalDependencies: string[]
  bundleDependencies?: string[]
  bundledDependencies?: string[]
}

type FSPath = PathLike & string
const PackageJSON: string = "package.json"
const PackageJSONEncodingFormat: string & BufferEncoding = "utf8"

const readPkgJSON = async (
  containingDirPath: FSPath
): Promise<NPMPackageJSON> => {
  return JSON.parse(
    await readFile(
      join(containingDirPath as string, PackageJSON),
      PackageJSONEncodingFormat
    )
  )
}

const writePkgJSON = async (
  containingDirPath: FSPath,
  newPkgJSON: NPMPackageJSON,
  signal?: AbortSignal
) => {
  return await writeFile(containingDirPath, JSON.stringify(newPkgJSON), {
    encoding: PackageJSONEncodingFormat,
    signal
  } as BaseEncodingOptions)
}

const makeTmpDir = async (
  prefix: FSPath = "tmp-install-dir-"
): Promise<FSPath> => {
  return await mkdtemp(join(tmpdir(), prefix))
}

const moveToDir = async (file: FSPath, dest: FSPath) => {
  return await rename(file, join(dest, basename(file)))
}

const makeDir = async (dirName: FSPath): Promise<Dir> => {
  await mkdir(dirName, 0o755)
  return await opendir(dirName, { encoding: PackageJSONEncodingFormat })
}

const removeDir = async (dirName: FSPath) => {
  return await rmdir(dirName, { recursive: true })
}

const removePath = async (dirName: FSPath) => {
  return await rm(dirName, { recursive: true })
}

export {
  readPkgJSON,
  writePkgJSON,
  makeTmpDir,
  moveToDir,
  makeDir,
  removeDir,
  removePath
}
