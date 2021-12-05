# **NPM Super Pack – An NPM Pkg Backup Tool**


## **About:** <a id="about"></a>
---
A tool for backing up NPM packages locally, for offline installs!


## **Contents:** <a id="contents"></a>
---
- [About](#about)
- [Table of Contents](#contents)
- [Project Goal](#goal)
- [Design Approach](#project-guide)
- [Pre-Alpha Specification](#basic-spec)
- ### [Very Crude Project Description](#lazy-spec)
  - [NPM SUUUUUPER Pack!](#npm-super-pack)
  - [Crude Project Description](#lazy-project-goal)
  - [Crude Implementation Description](#lazy-implementation)
  - [Crude CLI Description](#lazy-cli)
  - [Crude User Input Validation](#lazy-input-validation)
  - [Crude "Operations Queue"](#lazy-operations-queue)
  - [Crude FS Operations](#lazy-fs-handler)
  - [Crade Package Manager Compatibility Layer](#lazy-pkg-mgr-wrapper-api)
  - [Crude Package Class](#lazy-pkg-class)
- ### [Project TODO List](#todo-list)
  - [TODO: Future Goals](#todo-future-goals)
  - [TODO: Local Package Registry or Database Server](#todo-db-server)
  - [TODO: Prevent ReDoS Vulnerablities](#todo-regex)
  - [TODO: Future Install Methods](#todo-install)
- [Contrbute]()


## **Project Goal:** <a id="goal"></a>
---
Create a Node.js automation script to creat offline backups of NPM packages for later install with all necessary dependencies included, essencially improving on NPM's `npm pack`.

This is a project that's primarily designed to be a fun experience in making something from the conception of an idea, to the final delivery of MVP. Its auxillary purpose is to be a solution to an unresolved frustration I've had with NPM's offline package installation capabilities. Which, unlike Yarn Pkg, doesn't by default save installed packages offline.

So to solve this problem, this project was created.

## [Project's Guiding Princeples—"The UNIX Philosophy": Source Wikipedia](https://en.wikipedia.org/wiki/Unix_philosophy) <a id="project-guide"></a>

The Unix philosophy is documented by Doug McIlroy in the Bell System Technical Journal from 1978:

-     Make each program do one thing well. To do a new job, build afresh rather than complicate old programs by adding new "features".
-     Expect the output of every program to become the input to another, as yet unknown, program. Don't clutter output with extraneous information. Avoid stringently columnar or binary input formats. Don't insist on interactive input.
-     Design and build software, even operating systems, to be tried early, ideally within weeks. Don't hesitate to throw away the clumsy parts and rebuild them.
-     Use tools in preference to unskilled help to lighten a programming task, even if you have to detour to build the tools and expect to throw some of them out after you've finished using them.

It was later summarized by Peter H. Salus in A Quarter-Century of Unix (1994):

-     Write programs that do one thing and do it well.
-     Write programs to work together.
-     Write programs to handle text streams, because that is a universal interface.

In their award-winning Unix paper of 1974, Ritchie and Thompson quote the following design considerations:

-     Make it easy to write, test, and run programs.
      Interactive use instead of batch processing.
-     Economy and elegance of design due to size constraints ("salvation through suffering").
-     Self-supporting system: all Unix software is maintained under Unix.

## **Basic Pre-Alpha Implementation Specification (Work In Progress):** <a id="basic-spec"></a>
---

- ### **CLI Design:**
- ### **NPM vs Yarn Integration:**
- ### **Pkg Resistry Compatibility List:**


## **API Specification:**
- ### **Input Sanitization:**
- ### **Operation Execution Queue:**
  - ### **Operations Batch:**
  - ### **Fallback Operations:**
  - ### **File System:**
  - ### **Network Requests:**
- ### **File System Handlers:**
- ### **TODO:**
- ### **TODO:**
- ### **TODO:**
- ### **TODO:**
- ### **TODO:**
- ### **TODO:**



# Raw Transcibal of Notes: <a id="lazy-spec"></a>

## NPM Super Pack: Automated NPM backup script: <a id="npm-super-pack"></a>

## Project Goal: <a id="lazy-project-goal"></a>

Create a Node.js and Bash automation script to create off-line backups of NPM packages for later install with ALL necasary dependancies included. Improving on NPM `pack`.

## Keystone Implementation Steps: <a id="lazy-implementation"></a>

### Command-line arguments: <a id="lazy-cli"></a>

Command-line arguments should have the behavior of NPM `install` and NPM `pack` combined. Allowing NPM pkgs to be installed and also added to NPM's `/_cacache` file. It should most importantly have a pkg's "production" deps installed as "bundled" deps, otherwise, the deps won't be backed up when NPM `pack` is used. There should also be options to install and backup "optional", "development", and "peer" deps. 

- If the "no" deps option is used, not even a pkg's "bundled" dep will be installed.
- If the "bundled" deps option is used, then the pkg will be installed as if the normal NPM `pack` command was used, and only the deps included by default will be backed up.
- "production" deps option, same behavior as NPM `install`.
- "development" deps option, same behavior as NPM `install`.
- "peer" deps option, same behavior as NPM `install`.
- If the "all" deps option is used, then "bundled", "production", "optional", "development", and "peer" deps will be installed.

There should be a way to use `npm install`'s ability to use Git repository URLs and local file system file paths for pkg installs, and also backups. And there should be an argument for where in the file system to store pkg backups, and what format to use: `.tar`, `.gz`, `.tar.gz`, and `.tgz`.

### User Input Validation: <a id="lazy-input-validation"></a>

User input sanittization and sanitization should be used to prevent typos in command-line arguments and ensure the correct pkg is being installed in the intended way. All of the pkgs to be installed should be check against the registry to make sure the user is installing the intended pkg. 
While local file system pkg installs should ensure user permissions and intent to install said local pkg, if the pkg is outside of the Node.js and pkg manager's instalation llocation or the user's home directory.
And if the pkg is from a repo URL, then the repo owner/maintainer is confirmed to be trusted by the user, or the `whois` of the website is confirmed to be trused by the user. Along with showing the user the pkg contents to confirm it is the correct pkg.
Improper characters are also filtered out of the arguments according to the respective installation type, to prevent 'code injection' vulnerablities.

### File System Operations and The Operations Queue: <a id="lazy-operations-queue"></a>

All operations that affect the file system, or that have post-program effects, should be processed by the Operation Queue. The Ops-Q processes every external action, e.g.: making files and directories, and makes sure it's completed. But if there is an error of failure, the Ops-Q is disigned to automatically handle it, if it's recoverable. The entire program is run inside of an Ops-Q, so wheen a SIGINT (or simlar EVENT) is received, it will stop itself and clean up everything it was doing. Every Op added to the Ops-Q should have: 
- base execution locic
- error handling
- and program abort logic, (for SIGINT)

So it should be able to try, retry, and cancel, abort and undo itself. For co-dependant multi-step Ops, and Ops-Batch can be created from multiple Ops, but each Op still needs all of their own logic. If a prereqisite Op fails in the Ops-Q fails, the other Ops that depend on it should be aborted. But in an Ops-Batch, a prerequisite Op can have a Fallback-Op in case it fails. A Fallback-Op should have the same output as the original Op, or have multiple Ops in a Fallback-Ops Set, or "FlOps Set", if it is functionally different. All Ops that depended on a failed Op will become an "XOp".

### File System Handlers: <a id="lazy-fs-handler"></a>

File system handlers are used as convenient wrappers for file operations, and act as a live view of directories and dynamic files. It should use an asynchronous design for all operations, since disk resonce may take an extremely long time. Any static file system properties should be memouized to prevent unnecessary repeated checks. For dynamic FS properties, Getters/Setters should be used. If files/dirs are expectedd to move around the FS, then location-independant file referencing (like inodes in UNIN-like systems) should be used. Directory abstractions should have a nested structure of child files/dirs.

### Package Manager Facade Wapper API: <a id="lazy-pkg-mgr-wrapper-api"></a>

Because NPM's (also Yarn Pkg and Bower) CLI commands have many configurable runtime options (like NPM's `color`), and because commands, options, and syntax can change between pkg mgr. versions and different pkg mgrs (like Yarn Pkg, and Bower). It should be able to use all relevant `config` runtime settings. It sould be able to use all relevent CLI commands. And it should use the `Package` class for pkg info and input sanitization for each respective CLI command and pkg mgr.'s syntax.

### `Package` Class: <a id="lazy-pkg-class"></a>
A pkg handling API. It is the high-level interface for managing pkgs using a conveinient abstraction layer. It should use:
- the Ops-Q to keep track of co-dependant operations, 
- the Pkg Manager API to install and manage itself,
- and the FS handler to manage its file locations.

Some of the features it should have are:
- When the program starts with the input from the CLI, there should be a Singleton meta (manager) class that takes in user input for a pkg name and backup type (pkg deps, versions, etc.) and then the Singleton should create corresponding `Package` objects for the user specified input (after it comes form the integrated input sanitization and user pkg confirmation methods).
- The Singleton should do start a pkg install immeadiately after it has been confirmed, to improve performance.
- The Singleton should create an Ops-Q to handle all of the `Package` objects (and make a completion progress bar), and wait for all pkg installs to be finished beforegiving confirmation.
- The question if all pkgs have to be sucessfully installed up to all be backed up, otherwise they are all aborted. Or if the only the sucessful installs are backed up, with the unsucessful installs skipped with a non-fatal error output to the user asking how to handle the failed pkgs (retry install, select other pkg, etc.). Is likely to become a CLI option in the future, but is currently defaulted to keeping the sucessful pkgs.

Every `Package` object should use an Ops-Q to coordinate its installation according to the user specified CLI options, and by using the Package Manager wrapper API. Then it should use the FS handler to edit the `package.json`, and move, create, and delete files and folders. 

There could be another version of the `Package` class, possibly called the `Packer` class, that uses only the `npm pack` command and NPM's `_cacache`. And then it runs it on every dep on a pkg. There may be a performace difference between the `Package` and `Packer` classes, so the Singleton could also decide which to import and use for best performance (using less memory, CPU time, power, network bandwidth, etc.).


### Possible Development Environment Tools: <a id="dev-env"></a>
For production: oclif, yargs, ora, chalk, boxen, inquirerer/commander.

For Development: TypeScript, Babel, ESLint, Preitter, JSDoc, Gulp, Jest.


## **TODO:** <a id="todo-list"></a>
---
- [x] Write initial specification in README.
- [ ] Create API specification.
- [ ] Create API documentation.
- [ ] Implement cryptographic checksum backup integrity validation.
- [ ] Create live offline database functionality.
- [ ] Bash version for Bash shell, Zsh shell, Bourne-compatible shells, and Windows GitBash.
- [ ] Python version for universal use.
- [ ] etc...
- [ ] Publish Bash and Python versions to package repositories:
  - [ ] Flatpak
  - [ ] Snap
  - [ ] Homebrew
  - [ ] Macports
  - [ ] Flink
  - [ ] Scoop
  - [ ] Chocolatety
  - [ ] WinGet
  - [ ] Debian/Ubuntu APT
  - [ ] openSUSE/Fedora RPM
  - [ ] Arch AUR
  - [ ] BSD Port


## Future Goals: <a id="todo-future-goals"></a>
To future-proof the CLI, here are some improvements that will be needed:
- Create a version that doesn't use any NPM deps, all tools built in-house.
- A version that is compatible with using repo URLs to install pkgs from, possibly using `cURL` or `WGet`.
- A shell script version that uses the code from the `jq` library code in the codebase, so a Node.js runtime isn't required.
- A local offline registry server to use as an install location, to be seemlessly integrated with the pkg manager, like `npm install`.


### Backup Database (Server?): <a id="todo-db-server"></a>
Pkg backup database using checksums for integrity verification. It has write-protection on the pkg backup database and every pkg backup is read-only to prevent malicious pkg backup alteration. But if a database isn't used, then all pkg backups should have  hashes to check against their checksums, to make sure it wasn't altered, before installing it.

The SHA3 checksums should be stored in a write-protected read-only format (using file prermmissions if possible). And each checksum entry should correspond to a specific pkg backup with a unique ID, so multiple different verions of the same pkg can be backed up.


### Better RegExp? <a id="todo-regex"></a>
To prevent REDoS (Regular Expression Denial of Service) attacks, it may be beneficial to implement a time-limit to RegExp execution, (in addition to using a length-limit). tthis may be possible to do using some async code, like using Intervals and `Promises`. But it may require a custom RegExp implementation, most likely best implemented in Web Assembly, where it is less general-purpose but faster at evaluations.

---
### **TODO: Install:** <a id="todo-install"></a>
```bash
    $ npm install --global # TODO: make NPM pkg like: "npm-pkg-packer@alpha" or something...
```

---
# Contributing:
As of the moment, this project is just a learning experience. But contributions are still welcome, they may just take a while to be reviewed. I also have not made a CONTRIBUTING just yet, so it will be looked into in the future...