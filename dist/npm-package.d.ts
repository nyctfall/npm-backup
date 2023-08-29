import { ExecFileAsyncResult, ExecFileResult } from "./custom-utils";
import * as semver from "semver";
import { OpsPipeline as Q } from "./op-queue-pipeline";
import { FSPath } from "./file-handle";
import { OptionValues } from "commander";
declare type NPMCommand = "access" | "adduser" | "audit" | "bin" | "bugs" | "cache" | "ci" | "completion" | "config" | "dedupe" | "deprecate" | "diff" | "dist-tag" | "docs" | "doctor" | "edit" | "exec" | "explain" | "explore" | "find-dupes" | "fund" | "help" | "help-search" | "hook" | "init" | "install" | "install-ci-test" | "install-test" | "link" | "logout" | "ls" | "org" | "outdated" | "owner" | "pack" | "ping" | "pkg" | "prefix" | "profile" | "prune" | "publish" | "rebuild" | "repo" | "restart" | "root" | "run-script" | "search" | "set-script" | "shrinkwrap" | "star" | "stars" | "start" | "stop" | "team" | "test" | "token" | "uninstall" | "unpublish" | "unstar" | "update" | "version" | "view" | "whoami" | "npx";
export declare class Pkg {
    #private;
    static readonly NPMSearchPkgRegex: RegExp;
    static readonly NPMSearchResultRegex: RegExp;
    static commands: string[];
    static argSanitize: (rawArg: string) => string;
    static argvSanitize: (rawArgv: string[]) => string[];
    view: string;
    path: FSPath;
    conf: boolean;
    search: string[];
    set name(newName: string);
    get name(): string;
    set version(newVer: semver.SemVer["version"]);
    get version(): semver.SemVer["version"];
    constructor({ name }: {
        name: string;
    });
    static init({ location, opts, raw }: {
        location: FSPath;
        opts: string[];
        raw?: false | undefined;
    }): Promise<string>;
    static init({ location, opts, raw }: {
        location: FSPath;
        opts: string[];
        raw?: boolean;
    }): Promise<ExecFileResult>;
    static install({ pkgs, location, opts, raw }: {
        pkgs: string[];
        location: FSPath;
        opts: string[];
        raw?: false | undefined;
    }): Promise<string>;
    static install({ pkgs, location, opts, raw }: {
        pkgs: string[];
        location: FSPath;
        opts: string[];
        raw?: boolean;
    }): Promise<ExecFileResult>;
    static view({ pkg, opts, raw }: {
        pkg: string;
        opts: string[];
        raw?: false | undefined;
    }): Promise<string>;
    static view({ pkg, opts, raw }: {
        pkg: string;
        opts: string[];
        raw?: boolean;
    }): Promise<ExecFileResult>;
    static search({ terms, opts, raw }: {
        terms: string[];
        opts: string[];
        raw?: false | undefined;
    }): Promise<string>;
    static search({ terms, opts, raw }: {
        terms: string[];
        opts: string[];
        raw?: boolean;
    }): Promise<ExecFileResult>;
    static pack({ pkgs, location, opts, cd, raw }: {
        pkgs: string[];
        location: FSPath;
        opts: string[];
        cd?: boolean;
        raw?: false | undefined;
    }): Promise<string>;
    static pack({ pkgs, location, opts, cd, raw }: {
        pkgs: string[];
        location: FSPath;
        opts: string[];
        cd?: boolean;
        raw?: boolean;
    }): Promise<ExecFileResult>;
    static npm(...args: string[]): ExecFileAsyncResult;
    static npmCommand(command: NPMCommand, ...args: string[]): ExecFileAsyncResult;
    static innit: typeof Pkg.init;
    static create: typeof Pkg.init;
    static i: typeof Pkg.install;
    static in: typeof Pkg.install;
    static ins: typeof Pkg.install;
    static inst: typeof Pkg.install;
    static insta: typeof Pkg.install;
    static instal: typeof Pkg.install;
    static isnt: typeof Pkg.install;
    static isnta: typeof Pkg.install;
    static isntal: typeof Pkg.install;
    static isntall: typeof Pkg.install;
    static add: typeof Pkg.install;
    static v: typeof Pkg.view;
    static info: typeof Pkg.view;
    static show: typeof Pkg.view;
    static s: typeof Pkg.search;
    static se: typeof Pkg.search;
    static find: typeof Pkg.search;
}
export declare const pkgPack: ({ pkg, opts, location }: {
    pkg: Pkg;
    location: FSPath;
    opts: OptionValues;
}) => Promise<string>;
export declare const pkgTmpInit: (location: FSPath) => Promise<string>;
export declare const pkgSearchQ: Q;
export declare const pkgSearch: (...pkgNames: string[]) => Promise<Pkg[]>;
export declare const pkgConfirmQ: Q;
export declare const pkgConfirm: (...pkgList: Pkg[]) => Promise<unknown>;
export declare const pkgInstallQ: Q;
export {};
