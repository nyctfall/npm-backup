import { ExecFileAsyncResult, ExecFileResult, utilPromise } from "./custom-utils"
import * as semver from "semver"
import * as inquirer from "inquirer"
import { OpsPipeline as Q } from "./op-queue-pipeline"
import { argvSanitize, argSanitize } from "./arg-parse-utils"
import { FSPath } from "./file-handle"
import { cwd, chdir } from "process"
import { OptionValues } from "commander"
import * as path from "path"

/**
  @debrief - This module has all of the NPM search, pkg installing, and other NPM commands.

  * @todo
  * Arguments:
    * MVP:
      * NPM pkgs
      * target NPM pkg backup output dir
      * deps to backup all or a mix of {production|development|optional|peer}
      * version to get, eg: @ latest, or a list of versions to get
    * 
    * Extra:
      * multi-pkg backups, with many pkgs's deps installed and deduped
      * chronlogical acrhive mode that backs up all versions {major.minor.patch}
    * 
  * Run:
    * sanitize user input:
      * remove ALL characters that aren't used on NPM
      * only allow: '.' '@', '/', '-', A-Z, a-z, and 0-9
    * 
    * get user confimation of desired pkgs:
      * use NPM search for every string arg, to prevent misspelling
      * use NPM view to confirm properly spelled pkgs
    * 
    * create tmp dir for NPM pkg installs:
      * mkdir
      * cd into dir
      * npm install using --global-style so the deps will be in the pkgs's dir in node_modules
    * 
    * edit package.json files for every pkg to add all {production|optional|development} deps to bundeledDependencies field:
      * use JSON.parse() to get deps
      * edit object to add props
      * use JSON.stringify() to rewrite package.json file
    * 
    * make offline NPM pkg backup:
      * use npm pack, adds pkg to NPM cache
      * OR use tar -cwzvf /path/to/bkup/dir NPM-pkg-dir
      * -z is to select gzip compression
      * this doesn't add pkg to NPM cache
    *
    * clean up tmp dir and move pkg backups to target dir:
      * rm tmp npm install dir
      * mv pkg backups to target dir
  * 
*/


const { execFile } = utilPromise

// all valid npm commands (excluding aliases):
type NPMCommand = "access" | "adduser" | "audit" | "bin" | "bugs" | "cache" | "ci" | "completion" | "config" | "dedupe" | "deprecate" | "diff" | "dist-tag" | "docs" | "doctor" | "edit" | "exec" | "explain" | "explore" | "find-dupes" | "fund" | "help" | "help-search" | "hook" | "init" | "install" | "install-ci-test" | "install-test" | "link" | "logout" | "ls" | "org" | "outdated" | "owner" | "pack" | "ping" | "pkg" | "prefix" | "profile" | "prune" | "publish" | "rebuild" | "repo" | "restart" | "root" | "run-script" | "search" | "set-script" | "shrinkwrap" | "star" | "stars" | "start" | "stop" | "team" | "test" | "token" | "uninstall" | "unpublish" | "unstar" | "update" | "version" | "view" | "whoami" | "npx"

// NPM package object:
export class Pkg {
  /* 
  // only use chars allowed in NPM:
  // only allow: A-Z, a-z, 0-9, '@', '/', '.', '_', and '-'.
  // this regex will match not allowed chars.
  static readonly unsafeNPMRegex: RegExp = /[^\w@/_.-]/gi

  // this regex will match only allowed chars.
  static readonly NPMPkgRegex: RegExp = /^[\w@/_.-]+/

  
  // this will do the post processing that NPMSearchPkgRegex needs to make a complete pkg name:
  static NPMSeachPkg() {}
  */

  // this will find pkg name is NPM search results even in non-parseable mode:
  // will even work with long and non-long mode,
  // multi-line pkgs will need some further proessing though...
  static readonly NPMSearchPkgRegex: RegExp = /^[\w@/.-]+(?= {2,})|^[\w@/.-]+.+(?:[\r|\n|\r\n][\w@/.-]+(?=.+\| +\|).*)+/gim

  // this will split each search result into a seperate match:
  static readonly NPMSearchResultRegex: RegExp = /(?=^[\w@/.-]+(?!.*\| +\|)(?:.*\n.+(?:\| +\|)+.*)*)/gim

  // all valid NPM commands (excluding aliases):
  static commands: string[] = ["access", "adduser", "audit", "bin", "bugs", "cache", "ci", "completion", "config", "dedupe", "deprecate", "diff", "dist-tag", "docs", "doctor", "edit", "exec", "explain", "explore", "find-dupes", "fund", "help", "help-search", "hook", "init", "install", "install-ci-test", "install-test", "link", "logout", "ls", "org", "outdated", "owner", "pack", "ping", "pkg", "prefix", "profile", "prune", "publish", "rebuild", "repo", "restart", "root", "run-script", "search", "set-script", "shrinkwrap", "star", "stars", "start", "stop", "team", "test", "token", "uninstall", "unpublish", "unstar", "update", "version", "view", "whoami"]

  // this sanitizes string input to the NPM child process:
  static argSanitize = argSanitize
  static argvSanitize = argvSanitize
  
  #_id: string = ""
  #_version: string = ""
  view: string = ""
  path: FSPath = ""
  conf: boolean = false
  search: string[] = []

  set name(newName: string) {
    this.#_id = Pkg.argSanitize(newName)
  }

  get name(): string {
    return this.#_id
  }

  set version(newVer) {
    this.#_version = semver.valid(semver.coerce(newVer)) ?? this.#_version
  }

  get version(): semver.SemVer["version"] {
    return this.#_version
  }

  constructor({ name }: { name: string }) {
    // set the pkg name id to a shell and NPM safe string:
    this.#_id = Pkg.argSanitize(name)
  }


  // npm init command to create install package:
  static async init({ location, opts, raw }: { location: FSPath, opts: string[], raw?: false | undefined }): Promise<string>
  static async init({ location, opts, raw }: { location: FSPath, opts: string[], raw?: boolean }): Promise<ExecFileResult>
  static async init({ location, opts, raw }: { location: FSPath, opts: string[], raw?: boolean }): Promise<string | ExecFileResult> {
    // save old working directory:
    const currentDir = cwd()
    
    // change current working directory to the npm init location:
    chdir(location)
    
    // init npm package.json in current directory:
    const result = await this.npmCommand("init", ...opts)
    
    // change back to the old working directory:
    chdir(currentDir)

    if (raw) return result

    return result.stdout
  }

  // npm command to install pkgs:
  static async install({ pkgs, location, opts, raw }: { pkgs: string[], location: FSPath, opts: string[], raw?: false | undefined }): Promise<string>
  static async install({ pkgs, location, opts, raw }: { pkgs: string[], location: FSPath, opts: string[], raw?: boolean }): Promise<ExecFileResult>
  static async install({ pkgs, location, opts, raw }: { pkgs: string[], location: FSPath, opts: string[], raw?: boolean }): Promise<string | ExecFileResult> {
    // save old working directory:
    const currentDir = cwd()

    // change current working directory to the npm init location:
    chdir(location)
    
    // install npm pkgs in current directory:
    const result = await this.npmCommand("install", ...opts, ...pkgs)
    
    // change back to the old working directory:
    chdir(currentDir)

    if (raw) return result

    return result.stdout
  }

  // npm info command to get information about a pkg in registry:
  static async view({ pkg, opts, raw }: { pkg: string, opts: string[], raw?: false | undefined }): Promise<string>
  static async view({ pkg, opts, raw }: { pkg: string, opts: string[], raw?: boolean }): Promise<ExecFileResult>
  static async view({ pkg, opts, raw }: { pkg: string, opts: string[], raw?: boolean }): Promise<string | ExecFileResult> {
    const result = await this.npmCommand("view", ...opts, pkg)

    if (raw) return result

    return result.stdout
  }

  // npm search command to find pkgs in registry:
  static async search({ terms, opts, raw }: { terms: string[], opts: string[], raw?: false | undefined }): Promise<string>
  static async search({ terms, opts, raw }: { terms: string[], opts: string[], raw?: boolean }): Promise<ExecFileResult>
  static async search({ terms, opts, raw }: { terms: string[], opts: string[], raw?: boolean }): Promise<string | ExecFileResult> {
    const result = await this.npmCommand("search", ...opts, ...terms)
    
    if (raw) return result
    
    return result.stdout
  }

  // npm command to install pkgs:
  static async pack({ pkgs, location, opts, cd, raw }: { pkgs: string[], location: FSPath, opts: string[], cd?: boolean, raw?: false | undefined }): Promise<string>
  static async pack({ pkgs, location, opts, cd, raw }: { pkgs: string[], location: FSPath, opts: string[], cd?: boolean, raw?: boolean }): Promise<ExecFileResult>
  static async pack({ pkgs, location, opts, cd, raw }: { pkgs: string[], location: FSPath, opts: string[], cd?: boolean, raw?: boolean }): Promise<string | ExecFileResult> {
    let result: ExecFileResult
    
    // use location as pack destination:
    if (cd){
      // save old working directory:
      const currentDir = cwd()
      
      // change current working directory to the npm pack location:
      chdir(location)

      // pack pkgs in current directory:
      result = await this.npmCommand("pack", ...opts, ...pkgs)
      
      // change back to the old working directory:
      chdir(currentDir)
    }
    else {
      // pack pkgs in destination directory:
      result = await this.npmCommand("pack", `--pack-destination ${location}`, ...opts, ...pkgs)  
    }

    if (raw) return result

    return result.stdout
  }

  // reusable for npm cli:
  static async npm (...args: string[]): ExecFileAsyncResult {
    // exec using sanitized string:
    return await execFile("npm", this.argvSanitize(args))
  }

  // reusable for all npm commands:
  static async npmCommand (command: NPMCommand, ...args: string[]): ExecFileAsyncResult {
    // check a valid command is being used:
    if (!this.commands.includes(command)) throw Error("Invalid or incompatible NPM command for NPM wrapper")
    
    return await this.npm(command, ...args)
  }

  // command aliases:
  static innit = this.init
  static create = this.init
  static i = this.install
  static in = this.install
  static ins = this.install
  static inst = this.install
  static insta = this.install
  static instal = this.install
  static isnt = this.install
  static isnta = this.install
  static isntal = this.install
  static isntall = this.install
  static add = this.install
  static v = this.view
  static info = this.view
  static show = this.view
  static s = this.search
  static se = this.search
  static find = this.search
}


// convert Commander.js OptionValues to npm CLI compatible format:
const pkgComToOpt = (opts: OptionValues): string[] => {
  // make npm compatable string array for options:
  // use `--option` syntax, space if just a flag, should work for options with `=value`
  // `--option  `, or `--option value`
  return Object.entries(opts).map(opt => {
    // make the OptionVaule, eg `saveDev`, syntax
    // npm compatible, eg `--save-dev`, syntax:
    let optName = opt[0]
    const optMatch = optName.match(/[A-Z]/g)

    // replace in string:
    if (optMatch){
      for (const match of optMatch){
        optName = optName.replace(match, `-${match.toLowerCase()}`)
      }
    }
    
    // if the option doesn't have a value, use empty string:
    const optVal = (opt[1] !== "") ? ` ${opt[1]}` : ""
    
    return `--${optName}`+optVal
  })
}


// convert Pkg format to npm search compatible format:
const pkgSearchResults = (pkg: Pkg) => {
  // use default values if they are no results:
  const results = [
    {
      value: "", // empty string will result in no pkg being installed
      name: `Do not install: "${pkg.name}"`
    },
    {
      value: pkg.name, // just install the same pkg
      name: `Install: "${pkg.name}"`
    }
  ]
  
  // make sure there are results:
  if (pkg.search.length > 0) {
    // loop through each search result:
    for (const res of pkg.search){ 
      // array from npm parseable output that is tab delimited:
      const resFields = res.split("\t", 5)

      results.push({
        // pkg that is installed
        value: resFields[0],
        //  shown to user: pkg name, version, description, date published, maintainers:
        name: `${resFields[0]}  ${resFields[4]}  ${resFields[1]}  ${resFields[3]}  ${resFields[2]}` 
      })
    }
  }
  
  return results
}


// pack npm package:
export const pkgPack = async ({ pkg, opts, location }: { pkg: Pkg, location: FSPath, opts: OptionValues }) => {
  return await Pkg.pack({ pkgs: [pkg.name], location, opts: pkgComToOpt(opts), cd: true })
}


// make a temporary npm package to install to:
export const pkgTmpInit = async (location: FSPath) => {
  return await Pkg.init({ location, opts: ["--yes"] })
}


// searches pkg registry to find selected pkgs:
export const pkgSearchQ = new Q("Searching Registry For Packages", { useShell: true/* , useVerbose: true, useDebug: true */ })
.pipe(({ opts, args }: { opts: OptionValues, args: string[] }) => {
  const pkgs: Pkg[] = []
  let i = 0

  // create an array of Pkg object to the corresponding pkg to be installed:
  for (const name of args) {
    pkgs[i] = new Pkg({ name })
    i++
  }

  return { opts, pkgs}
}, "Creating Package List")
.pipe(async ({ opts, pkgs }: { opts: OptionValues, pkgs: Pkg[] }) => {
  // save the pkg search results data to each Pkg object:
  for (const pkg of pkgs) {
    // get newline separated results:
    const foundPkgs = await Pkg.search({ opts: ["--long", "--parseable", "--color=false"], terms: [pkg.name] })
    
    // split each result into an array index, and remove empty lines:
    pkg.search = foundPkgs.split("\n").filter(res => res !== "")
  }

  return { opts, pkgs }
}, "Searching For Possible Packages")
.pipe(async ({ opts, pkgs }: { opts: OptionValues, pkgs: Pkg[] }) => {
  // save the pkg info data to each Pkg object:
  for (const pkg of pkgs) {
    pkg.view = await Pkg.view({ pkg: pkg.name, opts: ["--color=true"] })
  }

  return { opts, pkgs }
}, "Getting Info On Found Packages")

export const pkgSearch = async (...pkgNames: string[]): Promise<Pkg[]> => {
  return (await pkgSearchQ.start(pkgNames)).pipe[0] as Pkg[]
}


// confirm pkgs to be installed from registry:
export const pkgConfirmQ = new Q("Confirming Packages With User"/* , { useVerbose: true, useDebug: true } */)
.pipe(async ({ opts, pkgs }: { opts: OptionValues, pkgs: Pkg[] }) => {
  // ask user if pkg is correct:
  for (const pkg of pkgs){
    pkg.conf = (await inquirer.prompt({
      type: "confirm",
      name: "conf",
      default: false,
      message: `${pkg.view || pkg.name}
Is this the correct package: "${pkg.name}"?`
    })).conf
  }
  
  return { opts, pkgs }
}, "Confirming Exact Packages")
.pipe(async ({ opts, pkgs }: { opts: OptionValues, pkgs: Pkg[] }) => {
  // ask user to select correct pkg from search results:
  for (const pkg of pkgs){
    // default to not installing pkg:
    const nullPkg = `Do not install: "${pkg.name}"`
    
    // only correct unconfirmed pkgs:
    if (!pkg.conf){
      pkg.name = (await inquirer.prompt({
        type: "list",
        name: "name",
        message: "Select the correct package:",
        default: nullPkg,
        choices: pkgSearchResults(pkg)
      })).name
      
      // empty string for pkg name will result in no pkg being installed
      if (pkg.name !== "") pkg.conf = true
    }
  }

  // remove deselected pkgs, reversing through array to prevent skipping indecies:
  for (let i = pkgs.length - 1; i >= 0; i--){
    // remove only unconfirmed pkgs:
    if (pkgs[i].conf === false) pkgs.splice(i, 1)
  }

  return { opts, pkgs }
}, "Sustituting Incorrect Packages")

export const pkgConfirm = async (...pkgList: Pkg[]) => {
  return (await pkgConfirmQ.start(pkgList)).pipe[0]
}


// install pkgs:
export const pkgInstallQ = new Q("Installing Packages", { useShell: true/* , useVerbose: true, useDebug: true */ })
.pipe(async ({ opts, pkgs, tmpDir: location }: { opts: OptionValues, pkgs: Pkg[], tmpDir: FSPath }) => {
  // make array of only the names of the pkgs:
  const pkgNames = pkgs.map(pkg => pkg.name)

  // make npm compatable string array for options:
  // use `--option` syntax, space if just a flag, should work for options with `=value`
  // `--option  `, or `--option value`
  const npmOptions = pkgComToOpt(opts)
  
  // log output from npm
  // install using global-style to store pkg deps in each pkg's node_modules
  // no-save will not create a package.json:
  const res = await Pkg.install({ pkgs: pkgNames, opts: ["--global-style", "--no-save", "--color=true", ...npmOptions], location, raw: true })
  console.error(res.stderr)
  console.log(res.stdout)

  return { opts, pkgs, location }
}, "Installing")
.pipe(({ opts, pkgs, location }: { opts: OptionValues, pkgs: Pkg[], location: FSPath }) => {
  for (const pkg of pkgs) {
    pkg.path = path.join(location, "node_modules", pkg.name)
  }
  
  return { opts, pkgs }
}, "Saving Install Location")

/* export const pkgInstall = async ({ pkgs, opts, location }: { pkgs: Pkg[], opts: OptionValues, location: FSPath }) => {
  return (await pkgInstallQ.start({ pkgs, opts, location })).pipe[0].pkgs
} */



/* (async () => {
  const p = await pkgSearch("npm")
  console.log(pkgSearchResults(p[0]))
})() */