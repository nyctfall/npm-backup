"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pkgInstallQ = exports.pkgConfirm = exports.pkgConfirmQ = exports.pkgSearch = exports.pkgSearchQ = exports.pkgTmpInit = exports.pkgPack = exports.Pkg = void 0;
const custom_utils_1 = require("./custom-utils");
const semver = require("semver");
const inquirer = require("inquirer");
const op_queue_pipeline_1 = require("./op-queue-pipeline");
const arg_parse_utils_1 = require("./arg-parse-utils");
const process_1 = require("process");
const path = require("path");
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
const { execFile } = custom_utils_1.utilPromise;
// NPM package object:
class Pkg {
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
    static NPMSearchPkgRegex = /^[\w@/.-]+(?= {2,})|^[\w@/.-]+.+(?:[\r|\n|\r\n][\w@/.-]+(?=.+\| +\|).*)+/gim;
    // this will split each search result into a seperate match:
    static NPMSearchResultRegex = /(?=^[\w@/.-]+(?!.*\| +\|)(?:.*\n.+(?:\| +\|)+.*)*)/gim;
    // all valid NPM commands (excluding aliases):
    static commands = ["access", "adduser", "audit", "bin", "bugs", "cache", "ci", "completion", "config", "dedupe", "deprecate", "diff", "dist-tag", "docs", "doctor", "edit", "exec", "explain", "explore", "find-dupes", "fund", "help", "help-search", "hook", "init", "install", "install-ci-test", "install-test", "link", "logout", "ls", "org", "outdated", "owner", "pack", "ping", "pkg", "prefix", "profile", "prune", "publish", "rebuild", "repo", "restart", "root", "run-script", "search", "set-script", "shrinkwrap", "star", "stars", "start", "stop", "team", "test", "token", "uninstall", "unpublish", "unstar", "update", "version", "view", "whoami"];
    // this sanitizes string input to the NPM child process:
    static argSanitize = arg_parse_utils_1.argSanitize;
    static argvSanitize = arg_parse_utils_1.argvSanitize;
    #_id = "";
    #_version = "";
    view = "";
    path = "";
    conf = false;
    search = [];
    set name(newName) {
        this.#_id = Pkg.argSanitize(newName);
    }
    get name() {
        return this.#_id;
    }
    set version(newVer) {
        this.#_version = semver.valid(semver.coerce(newVer)) ?? this.#_version;
    }
    get version() {
        return this.#_version;
    }
    constructor({ name }) {
        // set the pkg name id to a shell and NPM safe string:
        this.#_id = Pkg.argSanitize(name);
    }
    static async init({ location, opts, raw }) {
        // save old working directory:
        const currentDir = (0, process_1.cwd)();
        // change current working directory to the npm init location:
        (0, process_1.chdir)(location);
        // init npm package.json in current directory:
        const result = await this.npmCommand("init", ...opts);
        // change back to the old working directory:
        (0, process_1.chdir)(currentDir);
        if (raw)
            return result;
        return result.stdout;
    }
    static async install({ pkgs, location, opts, raw }) {
        // save old working directory:
        const currentDir = (0, process_1.cwd)();
        // change current working directory to the npm init location:
        (0, process_1.chdir)(location);
        // install npm pkgs in current directory:
        const result = await this.npmCommand("install", ...opts, ...pkgs);
        // change back to the old working directory:
        (0, process_1.chdir)(currentDir);
        if (raw)
            return result;
        return result.stdout;
    }
    static async view({ pkg, opts, raw }) {
        const result = await this.npmCommand("view", ...opts, pkg);
        if (raw)
            return result;
        return result.stdout;
    }
    static async search({ terms, opts, raw }) {
        const result = await this.npmCommand("search", ...opts, ...terms);
        if (raw)
            return result;
        return result.stdout;
    }
    static async pack({ pkgs, location, opts, cd, raw }) {
        let result;
        // use location as pack destination:
        if (cd) {
            // save old working directory:
            const currentDir = (0, process_1.cwd)();
            // change current working directory to the npm pack location:
            (0, process_1.chdir)(location);
            // pack pkgs in current directory:
            result = await this.npmCommand("pack", ...opts, ...pkgs);
            // change back to the old working directory:
            (0, process_1.chdir)(currentDir);
        }
        else {
            // pack pkgs in destination directory:
            result = await this.npmCommand("pack", `--pack-destination ${location}`, ...opts, ...pkgs);
        }
        if (raw)
            return result;
        return result.stdout;
    }
    // reusable for npm cli:
    static async npm(...args) {
        // exec using sanitized string:
        return await execFile("npm", this.argvSanitize(args));
    }
    // reusable for all npm commands:
    static async npmCommand(command, ...args) {
        // check a valid command is being used:
        if (!this.commands.includes(command))
            throw Error("Invalid or incompatible NPM command for NPM wrapper");
        return await this.npm(command, ...args);
    }
    // command aliases:
    static innit = this.init;
    static create = this.init;
    static i = this.install;
    static in = this.install;
    static ins = this.install;
    static inst = this.install;
    static insta = this.install;
    static instal = this.install;
    static isnt = this.install;
    static isnta = this.install;
    static isntal = this.install;
    static isntall = this.install;
    static add = this.install;
    static v = this.view;
    static info = this.view;
    static show = this.view;
    static s = this.search;
    static se = this.search;
    static find = this.search;
}
exports.Pkg = Pkg;
// convert Commander.js OptionValues to npm CLI compatible format:
const pkgComToOpt = (opts) => {
    // make npm compatable string array for options:
    // use `--option` syntax, space if just a flag, should work for options with `=value`
    // `--option  `, or `--option value`
    return Object.entries(opts).map(opt => {
        // make the OptionVaule, eg `saveDev`, syntax
        // npm compatible, eg `--save-dev`, syntax:
        let optName = opt[0];
        const optMatch = optName.match(/[A-Z]/g);
        // replace in string:
        if (optMatch) {
            for (const match of optMatch) {
                optName = optName.replace(match, `-${match.toLowerCase()}`);
            }
        }
        // if the option doesn't have a value, use empty string:
        const optVal = (opt[1] !== "") ? ` ${opt[1]}` : "";
        return `--${optName}` + optVal;
    });
};
// convert Pkg format to npm search compatible format:
const pkgSearchResults = (pkg) => {
    // use default values if they are no results:
    const results = [
        {
            value: "",
            name: `Do not install: "${pkg.name}"`
        },
        {
            value: pkg.name,
            name: `Install: "${pkg.name}"`
        }
    ];
    // make sure there are results:
    if (pkg.search.length > 0) {
        // loop through each search result:
        for (const res of pkg.search) {
            // array from npm parseable output that is tab delimited:
            const resFields = res.split("\t", 5);
            results.push({
                // pkg that is installed
                value: resFields[0],
                //  shown to user: pkg name, version, description, date published, maintainers:
                name: `${resFields[0]}  ${resFields[4]}  ${resFields[1]}  ${resFields[3]}  ${resFields[2]}`
            });
        }
    }
    return results;
};
// pack npm package:
const pkgPack = async ({ pkg, opts, location }) => {
    return await Pkg.pack({ pkgs: [pkg.name], location, opts: pkgComToOpt(opts), cd: true });
};
exports.pkgPack = pkgPack;
// make a temporary npm package to install to:
const pkgTmpInit = async (location) => {
    return await Pkg.init({ location, opts: ["--yes"] });
};
exports.pkgTmpInit = pkgTmpInit;
// searches pkg registry to find selected pkgs:
exports.pkgSearchQ = new op_queue_pipeline_1.OpsPipeline("Searching Registry For Packages", { useShell: true /* , useVerbose: true, useDebug: true */ })
    .pipe(({ opts, args }) => {
    const pkgs = [];
    let i = 0;
    // create an array of Pkg object to the corresponding pkg to be installed:
    for (const name of args) {
        pkgs[i] = new Pkg({ name });
        i++;
    }
    return { opts, pkgs };
}, "Creating Package List")
    .pipe(async ({ opts, pkgs }) => {
    // save the pkg search results data to each Pkg object:
    for (const pkg of pkgs) {
        // get newline separated results:
        const foundPkgs = await Pkg.search({ opts: ["--long", "--parseable", "--color=false"], terms: [pkg.name] });
        // split each result into an array index, and remove empty lines:
        pkg.search = foundPkgs.split("\n").filter(res => res !== "");
    }
    return { opts, pkgs };
}, "Searching For Possible Packages")
    .pipe(async ({ opts, pkgs }) => {
    // save the pkg info data to each Pkg object:
    for (const pkg of pkgs) {
        pkg.view = await Pkg.view({ pkg: pkg.name, opts: ["--color=true"] });
    }
    return { opts, pkgs };
}, "Getting Info On Found Packages");
const pkgSearch = async (...pkgNames) => {
    return (await exports.pkgSearchQ.start(pkgNames)).pipe[0];
};
exports.pkgSearch = pkgSearch;
// confirm pkgs to be installed from registry:
exports.pkgConfirmQ = new op_queue_pipeline_1.OpsPipeline("Confirming Packages With User" /* , { useVerbose: true, useDebug: true } */)
    .pipe(async ({ opts, pkgs }) => {
    // ask user if pkg is correct:
    for (const pkg of pkgs) {
        pkg.conf = (await inquirer.prompt({
            type: "confirm",
            name: "conf",
            default: false,
            message: `${pkg.view || pkg.name}
Is this the correct package: "${pkg.name}"?`
        })).conf;
    }
    return { opts, pkgs };
}, "Confirming Exact Packages")
    .pipe(async ({ opts, pkgs }) => {
    // ask user to select correct pkg from search results:
    for (const pkg of pkgs) {
        // default to not installing pkg:
        const nullPkg = `Do not install: "${pkg.name}"`;
        // only correct unconfirmed pkgs:
        if (!pkg.conf) {
            pkg.name = (await inquirer.prompt({
                type: "list",
                name: "name",
                message: "Select the correct package:",
                default: nullPkg,
                choices: pkgSearchResults(pkg)
            })).name;
            // empty string for pkg name will result in no pkg being installed
            if (pkg.name !== "")
                pkg.conf = true;
        }
    }
    // remove deselected pkgs, reversing through array to prevent skipping indecies:
    for (let i = pkgs.length - 1; i >= 0; i--) {
        // remove only unconfirmed pkgs:
        if (pkgs[i].conf === false)
            pkgs.splice(i, 1);
    }
    return { opts, pkgs };
}, "Sustituting Incorrect Packages");
const pkgConfirm = async (...pkgList) => {
    return (await exports.pkgConfirmQ.start(pkgList)).pipe[0];
};
exports.pkgConfirm = pkgConfirm;
// install pkgs:
exports.pkgInstallQ = new op_queue_pipeline_1.OpsPipeline("Installing Packages", { useShell: true /* , useVerbose: true, useDebug: true */ })
    .pipe(async ({ opts, pkgs, tmpDir: location }) => {
    // make array of only the names of the pkgs:
    const pkgNames = pkgs.map(pkg => pkg.name);
    // make npm compatable string array for options:
    // use `--option` syntax, space if just a flag, should work for options with `=value`
    // `--option  `, or `--option value`
    const npmOptions = pkgComToOpt(opts);
    // log output from npm
    // install using global-style to store pkg deps in each pkg's node_modules
    // no-save will not create a package.json:
    const res = await Pkg.install({ pkgs: pkgNames, opts: ["--global-style", "--no-save", "--color=true", ...npmOptions], location, raw: true });
    console.error(res.stderr);
    console.log(res.stdout);
    return { opts, pkgs, location };
}, "Installing")
    .pipe(({ opts, pkgs, location }) => {
    for (const pkg of pkgs) {
        pkg.path = path.join(location, "node_modules", pkg.name);
    }
    return { opts, pkgs };
}, "Saving Install Location");
/* export const pkgInstall = async ({ pkgs, opts, location }: { pkgs: Pkg[], opts: OptionValues, location: FSPath }) => {
  return (await pkgInstallQ.start({ pkgs, opts, location })).pipe[0].pkgs
} */
/* (async () => {
  const p = await pkgSearch("npm")
  console.log(pkgSearchResults(p[0]))
})() */ 
//# sourceMappingURL=npm-package.js.map