#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm = require("../src-ts/npm-package");
const pkgFS = require("../src-ts/file-handle");
const Q = require("../src-ts/op-queue-pipeline");
const cli = require("../src-ts/arg-parse");
const process_1 = require("process");
/**
 * @fileoverview - The core function of the NPM package backup tool, packing downloaded pkgs with all deps for offline install.
 * Download the NPM pkg normally with network connection to NPM registry, installing all preferred dependencies using `--global-style`. Then add all of the deps to the pkg's `package.json` `bundleDependencies` field. Then use `npm pack` to save all of the deps in the tar archive of the pkg.
 * This will require, netowrk access, npm command from a shell child process, and file system read and write.
 */
// async IIFE used to substitute top-level await:
(async () => {
    let tmpDir;
    const options = await cli.command();
    const opts = options.opts?.() ?? {};
    /**
     * @summary Used for verbose mode, logs output messages for every Op.
     * @param args { Array<any> }
     */
    const verboseLog = async (...args) => {
        if (opts.verbose)
            console.log(...args);
    };
    // using the debug CLI option implies verbose:
    const env = {
        useVerbose: Boolean(opts.verbose) || Boolean(opts.debug),
        useDebug: Boolean(opts.debug) || opts.verbose >= 2,
        useNestingDebug: opts.debug >= 2 || opts.verbose >= 3
    };
    // make verbose and debug compatible with npm:
    opts.verbose = "";
    opts.debug = "";
    await new Q.OpsPipeline("Back Up Packages", { ...env, useNestingLog: true /* , useNestingDebug: true, useNestingVerbose: true */ })
        .pipe(cli.argParserQ)
        .pipe((command) => {
        // make verbose and debug compatible with npm:
        const opts = command.opts();
        opts.verbose = "";
        opts.debug = "";
        // save values from any used aliases:
        opts.dest = opts.dest ?? opts.save ?? opts.packDestination ?? opts.packageDestination;
        opts.packDestination = opts.packDestination ?? opts.dest ?? opts.save ?? opts.packageDestination;
        // have side effect in npm cli:
        delete opts.save;
        delete opts.packageDestination;
        return { opts, args: command.args };
    }, "Convert CLI Responce")
        .pipe(new Q.OpsPipeline("Finding Packages")
        /* .pipe(async ({ opts, args }: { opts: OptionValues, args: string[] }) => {
          // find all matching pkgs:
          return {
            opts,
            pkgs: await npm.pkgSearch(...args)
          }
        },"Searching For Packages") */
        .pipe(npm.pkgSearchQ)
        /* .pipe(async ({ opts, pkgs }: { opts: OptionValues, pkgs: npm.Pkg[] }) => {
          // confirm pkgs and pkg versions:
          return { opts, pkgs: await npm.pkgConfirm(...pkgs) }
        }, "Confirming Packages") */
        .pipe(npm.pkgConfirmQ))
        .pipe(new Q.OpsPipeline("Backup Process")
        .pipe(new Q.OpsPipeline("Preparing For Backup")
        .pipe(async ({ opts, pkgs }) => {
        // create tmp dir:
        tmpDir = await pkgFS.makeTmpDir();
        return {
            opts,
            pkgs,
            tmpDir
        };
    }, "Creating Temporary Install Directory")
    /* .pipe(async ({ opts, pipe: { pkgs, tmpDir } }: { opts: OptionValues , pipe: { pkgs: npm.Pkg[], tmpDir: pkgFS.FSPath } }) => {
      // create temporary package.json and node_modules to install to:
      return {
        opts,
        pipe: {
          pkgs,
          tmpDir,
          init: await npm.pkgTmpInit(tmpDir)
        }
      }
    }, "Creating Temporary NPM Package To Install To")
    .fallback((...args) => args, "Using Package Install Without package.json", { useLoopback: true }) */
    )
        .pipe(new Q.OpsPipeline("Backing Up Packages")
        /* .pipe(async ({ opts, pipe: { pkgs, tmpDir } }: { opts: OptionValues, pipe: { pkgs: npm.Pkg[], tmpDir: pkgFS.FSPath } }) => {
          // install the pkgs to the temp dir:
          return { opts, pkgs: await npm.pkgInstall({ pkgs, location: tmpDir, opts }) }
        },"Installing Packages") */
        .pipe(npm.pkgInstallQ)
        .pipe(async ({ opts, pkgs, tmpDir }) => {
        // modify the bundle deps of each pkg:
        for (const pkg of pkgs) {
            let pkgPath = pkg.path;
            let pkgJSON = await pkgFS.readPkgJSON(pkgPath);
            if (pkgJSON) {
                // modify package.json:
                if (opts.save) {
                    // add pkgs to bundled deps:
                    if ("bundledDependencies" in pkgJSON && pkgJSON.bundledDependencies instanceof Array) {
                        // use the pre-existing field:
                        if (opts.saveProd)
                            pkgJSON.bundledDependencies.push(...Object.keys(pkgJSON.dependencies));
                        if (opts.saveDev)
                            pkgJSON.bundledDependencies.push(...Object.keys(pkgJSON.devDependencies));
                        if (opts.saveOptional)
                            pkgJSON.bundledDependencies.push(...Object.keys(pkgJSON.optionalDependencies));
                        if (opts.savePeer)
                            pkgJSON.bundledDependencies.push(...Object.keys(pkgJSON.peerDependencies));
                    }
                    else {
                        // create a `bundleDependencies` field in the package.json or use the pre-existing field:
                        pkgJSON.bundleDependencies = (pkgJSON.bundleDependencies instanceof Array) ? pkgJSON.bundleDependencies : [];
                        if (opts.saveProd)
                            pkgJSON.bundleDependencies.push(...Object.keys(pkgJSON.dependencies));
                        if (opts.saveDev)
                            pkgJSON.bundleDependencies.push(...Object.keys(pkgJSON.devDependencies));
                        if (opts.saveOptional)
                            pkgJSON.bundleDependencies.push(...Object.keys(pkgJSON.optionalDependencies));
                        if (opts.savePeer)
                            pkgJSON.bundleDependencies.push(...Object.keys(pkgJSON.peerDependencies));
                    }
                }
            }
            await pkgFS.writePkgJSON(pkgPath, pkgJSON);
        }
        return { opts, pkgs, tmpDir };
    }, "Preparing Packages")
        .pipe(async ({ opts, pkgs, tmpDir }) => {
        // pack each pkg:
        for (const pkg of pkgs) {
            await npm.pkgPack({ pkg, location: opts.dest ?? tmpDir, opts });
        }
        return { pkgs, opts, tmpDir };
    }, "Packing Packages")
        .fallback(async ({ opts, pkgs, tmpDir }) => {
        // move each pkg to destination:
        for (const pkg of pkgs) {
            await pkgFS.moveToDir(pkg.path, opts.dest ?? (0, process_1.cwd)());
        }
        return { pkgs, opts, tmpDir };
    }, "Moving Packages"))
        .pipe(async (...args) => {
        // const [{ tmpDir }] = args
        await pkgFS.removeDir(tmpDir);
        return args;
    }, "Clean Up After Backup", { useLoopback: true })
        .pipe((...args) => {
        verboseLog("Finished Backup!");
        return args;
    }, "Output Success", { useLoopback: true }))
        .fallback(async (...args) => {
        verboseLog("FATAL ERROR!");
        await pkgFS.removeDir(tmpDir);
        return args;
    }, "Clean Up After Error", { useLoopback: true })
        .start({
        argv: process.argv,
        parser: cli.commander
    });
})();
//# sourceMappingURL=backup.js.map