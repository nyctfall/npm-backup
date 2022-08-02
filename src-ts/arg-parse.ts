import { Command, createCommand, Option } from "commander"
import { argvSanitize } from "./arg-parse-utils"
import { OpsPipeline } from "./op-queue-pipeline"
export { Command } from "commander"

/**
 * @fileoverview - Read the CLI input to get commands, arguments, and options.
 */

/** */
const verboseHandler = (placeholder: unknown, previousVerbosityLevel: number) => {
  void placeholder // used to satisfy typescript
  return Number(previousVerbosityLevel) + 1
}
const dbgHandler = (placeholder: unknown, previousDebugLevel: number) => {
  void placeholder // used to satisfy typescript
  return Number(previousDebugLevel) + 1
}
/**
 * 
 */
 export const commander = createCommand("npm-super-pack")
 .version("0.1.0")
 .description("A program to install NPM packages offline.")
 .combineFlagAndOptionalValue(false) // disable non-standard/uncommon option formats that cause unwanted conflicts with other options
//  .exitOverride() // disable Commander directly aborting Node.js process by exit on error itself
 .usage("[options] package [packages...]")
 .usage("[options] package [packages...] [--dest|--save [path]]")
// .usage("[options] path [path...]") /** @TODO */
 .argument("<package>", "The NPM package to install, is also used for installing offline packages.")
//  .argument("[path]", "The file location the NPM package will be downloaded to.") /** @TODO */
 /* .addOption(
  new Option("--production=[boolean], --production", "If true, save only the production dependencies of the package(s)")
   .choices(["true", "false"])
   .default("true")
 ) */
 .option("--production=[boolean], --production", "If true, save only the production dependencies of the package(s)")
 .addOption(
  new Option("-P, --save-prod, --production=true, --production", "Save the production dependencies of the package(s).")
 )
 .addOption(
  new Option("-B, --save-bundle", "Save the bundled dependencies of the package(s), this is the normal behavior of npm pack.")
 )
 .addOption(
  new Option("-D, --save-dev, --production=false", "Save both the production and dev dependencies of the package(s).")
   .implies({ saveProd: true })
 )
 .addOption(
  new Option("-O, --save-optional", "Save the production, dev, and optional dependencies of the package(s).")
   .implies({ saveProd: true, saveDev: true })
 )
 .addOption(
  new Option("--save-peer", "Save the peer dependencies of the package(s).")
   .implies({ saveProd: true })
 )
 .addOption(new Option("--save <path>", "Install package to file system location, also saves package to NPM's internal cache (_cacache).").conflicts("noSave"))
 .addOption(new Option("--dest <path>", "Install package to file system location, also saves package to NPM's internal cache (_cacache).").conflicts("noSave"))
 .addOption(new Option("--pack-destination <path>", "Install package to file system location, also saves package to NPM's internal cache (_cacache).").conflicts("noSave"))
 .addOption(new Option("--package-destination <path>", "Install package to file system location, also saves package to NPM's internal cache (_cacache).").conflicts("noSave"))
 .addOption(new Option("--no-save", "Does not install package, only saves package to NPM's internal cache (\"_cacache\").").conflicts("save"))
 .option("-E, --save-exact", "Saved dependencies will be configured with an exact version rather than using NPM's default semver range operator.")
 .option("-n, --dry-run", "Do not actually do anything, just print what would be done.")
 .option("-f, --force", "Override any warnings.")
 .option("-v, --verbose", "Print extra information.", verboseHandler, 0)
 .addOption(
  new Option("--debug", "Print debug information, use repeatedly to print more information.")
   .implies({ verbose: true })
   .argParser(dbgHandler)
   .default(0)
   .preset(0)
 )
 .option("--legacy-bundling", "Eliminates all automatic deduping and causes npm to install the package such that versions of npm prior to 1.4, such as the one included with node 0.8, can install the package.")
 .addOption(
  new Option("--omit <dependency types...>",'"prod", "dev", "optional", "bundle", or "peer" (can be set multiple times). Dependency types to omit from the installation. If a package type appears in both the --include and --omit lists, then it will be included.')
   .choices(["prod", "production", "dev", "optional", "bundle", "bundled", "peer"])
 )
 .addOption(
  new Option("--include <dependency types...>",'"prod", "dev", "optional", "bundle", or "peer" (can be set multiple times). Allows for defining which types of dependencies to install. This is the inverse of --omit=<type>. Dependency types specified in --include will not be omitted, regardless of the order in which omit/include are specified on the command-line.')
   .choices(["prod", "dev", "optional", "peer"])
 )
 .addOption(
  new Option("--strict-peer-deps", "If set to true, and --legacy-peer-deps is not set, then any conflicting peerDependencies will be treated as an install failure.")
   .conflicts("legacyPeerDeps")
 )
 .addOption(
  new Option("--legacy-peer-deps", "Causes npm to completely ignore peerDependencies, as in npm versions 3 through 6. If a package cannot be installed because of overly strict peerDependencies that collide, it provides a way to move forward resolving the situation. Use of legacy-peer-deps is not recommended, as it will not enforce the peerDependencies contract that meta-dependencies may rely on.")
   .conflicts("strictPeerDeps")
 )
 .option("--ignore-scripts", "Eliminates all automatic deduping and causes npm to install the package such that versions of npm prior to 1.4, such as the one included with node 0.8, can install the package.")
 .option("-y, --yes, --no-interactive, --auto, --automated", "Assumes yes to all questions, and don't ask for user input.")
 .option("-i, --interactive", "Show pretty menus to view, select, confirm, or change packages.")
 .option("--tag <tag>", "Install a package without giving a specific version, install the specified tag. ex: \"latest\"")
 .option("--proxy [url]", "A proxy to use for outgoing http requests. If the NPM HTTP_PROXY or http_proxy environment variables are set, proxy settings will be honored by NPM's underlying request library.")
 .option("--https-proxy [url]", "A proxy to use for outgoing https requests. If the NPM HTTPS_PROXY or https_proxy or HTTP_PROXY or http_proxy environment variables are set, proxy settings will be honored by the underlying make-fetch-happen library.")
 .option("--no-proxy <domain extentions...>, --noproxy <domain extentions...>", "Domain extensions that should bypass any proxies, (can be set multiple times). Also accepts a comma-delimited string. The default value is the NPM NO_PROXY environment variable.")
 /* .addOption(
  new Option("--progress=[boolean], --progress", "Display download and install progress reports. Default true.")
   .choices(["true", "false"])
   .default("true")
 ) */
 .option("--progress=[boolean], --progress", "Display download and install progress reports. Default true.")
 /* .addOption(
  new Option("--ignore-scripts <boolean>", "If true, npm does not run scripts specified in package.json files. Note that commands explicitly intended to run a particular script, such as npm start, npm stop, npm restart, npm test, and npm run-script will still run their intended script if ignore-scripts is set, but they will not run any pre-scripts or post-scripts. Default false.")
   .choices(["true", "false"])
   .default("false")
 ) */
 .option("--ignore-scripts <boolean>", "If true, npm does not run scripts specified in package.json files. Note that commands explicitly intended to run a particular script, such as npm start, npm stop, npm restart, npm test, and npm run-script will still run their intended script if ignore-scripts is set, but they will not run any pre-scripts or post-scripts. Default false.")
 .option("--no-progress", "Eliminates all progress reporting.")
 .option("--prefer-online", "If true, NPM staleness checks for cached data will be forced, always looking for fresh package data.")
 .option("--prefer-offline", "If true, NPM staleness checks for cached data will be bypassed, but missing data will be requested from the server. To force full offline mode, use --offline.")
 .option("--offline", "If true, NPM packages will be not be downloaded, but be sourced from the previously installed backups or NPM's cache.")
 .option("--package <packages...>, --packages <packages...>", "Clearly define the names of the package(s) to be installed.")
 .option("--node-version", "The nodeJS version to use when checking a package's \"engines\" setting.")
 .option("--max-sockets <number>, --maxsockets <number>", "The maximum number of connections to use per origin (protocol/host/port combination).")
 .option("--foreground-scripts", "Run all NPM build scripts (preinstall, install, and postinstall) for installed packages in the foreground process, sharing standard input, output, and error with the main NPM process. Note that this will generally make installs run slower, and be much noisier, but can be useful for debugging.")
 /* .addOption(
  new Option("--loglevel <level>, --log-level <level>, --npm-log-level <level>","")
   .choices(["silent", "error", "warn", "notice", "http", "timing", "info", "verbose", "silly"])
   .default("notice")
 ) */
 .addOption(
  new Option("--loglevel <level>, --log-level <level>, --npm-log-level <level>","The logging detail NPM uses.")
   .choices(["silent", "error", "warn", "notice", "http", "timing", "info", "verbose", "silly"])
 )


/**
 * 
 */
export const argParserQ = new OpsPipeline("Argument Parser"/* , { useDebug: true, useVerbose: false } */)
  .pipe(({ argv, parser }: { argv: string[], parser: Command }) => {
    // use only the user input, not the node path or executable name:
    if (argv === process.argv) argv = argv.slice(2)
    
    return {
      argv,
      parser
    }
  }, "Prepare ArgV")
  .pipe(({ argv, parser }: { argv: string[], parser: Command }) => {
    return {
      args: argvSanitize(argv),
      parser
    }
  }, "Input Sanitization")
  .pipe(({ args, parser }: { args: string[], parser: Command }) => {
    return parser.parse(args, { from: "user" })
  }, "Parsing Commands, Arguments, And Options")

/**
 * 
 */
export const argParser = (argv: string[] = process.argv, parser: Command = commander, Q: OpsPipeline = argParserQ) => {
  // use only the sanitized options and parse the options and arguments:
  return Q.start({ argv, parser })
}

/** 
 * 
 */
export const command = async (argv: string[] = process.argv.slice(2)): Promise<Command> => {
  return (await argParser(argv, commander)).pipe[0] as Command
}

/** 
 * 
 */
export const options = (command)()

/*
NPM package.json: (excerpt)

name

If you plan to publish your package, the most important things in your package.json are the name and version fields as they will be required. The name and version together form an identifier that is assumed to be completely unique. Changes to the package should come along with changes to the version. If you don't plan to publish your package, the name and version fields are optional.

The name is what your thing is called.

Some rules:

    The name must be less than or equal to 214 characters. This includes the scope for scoped packages.
    The names of scoped packages can begin with a dot or an underscore. This is not permitted without a scope.
    New packages must not have uppercase letters in the name.
    The name ends up being part of a URL, an argument on the command line, and a folder name. Therefore, the name can't contain any non-URL-safe characters.

Some tips:

    Don't use the same name as a core Node module.
    Don't put "js" or "node" in the name. It's assumed that it's js, since you're writing a package.json file, and you can specify the engine using the "engines" field. (See below.)
    The name will probably be passed as an argument to require(), so it should be something short, but also reasonably descriptive.
    You may want to check the npm registry to see if there's something by that name already, before you get too attached to it. https://www.npmjs.com/

A name can be optionally prefixed by a scope, e.g. @myorg/mypackage. See scope for more detail.
 */
/*
NPM install options:

  • -P, --save-prod: Package will appear in your dependencies. This is the default unless -D or -O are present.

  • -D, --save-dev: Package will appear in your devDependencies.

  • -O, --save-optional: Package will appear in your optionalDependencies.

  • --no-save: Prevents saving to dependencies.  When using any of the above options to save dependencies to your  package.json, there are two additional, optional flags:

  • -E, --save-exact: Saved dependencies will be configured with an exact version rather than using npm's default semver range operator.

  • -B, --save-bundle: Saved dependencies will also be added to your bundleDependencies list.  Further, if you  have  an npm-shrinkwrap.json  or package-lock.json then it will be updated as well.  <scope> is optional. The package will be downloaded from the registry associated with the specified scope. If no registry is associated with the given  scope the  default  registry is assumed. See npm help scope.  Note: if you do not include the @-symbol on your scope name, npm will interpret this as a GitHub repository instead, see below. Scopes names must also be followed  by  a  slash.

  The --tag argument will apply to all of the specified install targets. If a tag with the given name exists, the  tagged  version is preferred over newer versions.

  The --dry-run argument will report in the usual way what the install would have done without actually installing anything.

  The --package-lock-only argument will only update the package-lock.json, instead of checking node_modules and downloading dependencies.

  The -f or --force argument will force npm to fetch remote resources even if a local copy exists on disk.

  With the --production flag (or when the NODE_ENV environment variable is set to production), npm will not install modules listed in devDependencies. To install all modules listed in both dependencies and devDependencies when NODE_ENV environment variable is set to production, you can use --production=false.

    NOTE: The --production flag has no particular meaning when adding a dependency to a project.
 */
/*
NPM configuration options:

  See the npm help config help doc. Many of the configuration params have some effect on installation, since that's most of what npm does.

  These are some of the most common options related to installation.

  save
      • Default: true

      • Type: Boolean

      Save installed packages to a package.json file as dependencies.

      When used with the npm rm command, removes the dependency from package.json.

  save-exact
      • Default: false

      • Type: Boolean

      Dependencies saved to package.json will be configured with an exact version rather than using npm's default semver range operator.

  global
      • Default: false

      • Type: Boolean

      Operates  in  "global"  mode, so that packages are installed into the prefix folder instead of the current working directory.
      See npm help folders for more on the differences in behavior.

      • packages are installed into the {prefix}/lib/node_modules folder, instead of the current working directory.

      • bin files are linked to {prefix}/bin

      • man pages are linked to {prefix}/share/man

  global-style
      • Default: false

      • Type: Boolean

      Causes npm to install the package into your local node_modules folder with the same layout it uses with the global  node_modules folder. Only your direct dependencies will show in node_modules and everything they depend on will be flattened in their node_modules folders. This obviously will eliminate some deduping. If used with legacy-bundling, legacy-bundling will be preferred.

  legacy-bundling
      • Default: false

      • Type: Boolean

      Causes npm to install the package such that versions of npm prior to 1.4, such as the one included with node 0.8, can install the package. This eliminates all automatic deduping. If used with global-style this option will be preferred.

  strict-peer-deps
      • Default: false

      • Type: Boolean

      If set to true, and --legacy-peer-deps is not set, then any conflicting peerDependencies will be treated as an install  failure, even if npm could reasonably guess the appropriate resolution based on non-peer dependency relationships.

      By  default, conflicting peerDependencies deep in the dependency graph will be resolved using the nearest non-peer dependency specification, even if doing so will result in some packages receiving a peer dependency outside the range set in their package's peerDependencies object.

      When  such  and  override  is  performed,  a  warning  is  printed,  explaining  the  conflict  and the packages involved. If --strict-peer-deps is set, then this warning is treated as a failure.

  package-lock
      • Default: true

      • Type: Boolean

      If set to false, then ignore package-lock.json files when installing. This will also  prevent  writing  package-lock.json  if
      save is true.

      When  package package-locks are disabled, automatic pruning of extraneous modules will also be disabled. To remove extraneous modules with package-locks disabled use npm prune.

  omit
      • Default: 'dev' if the NODE_ENV environment variable is set to 'production', otherwise empty.

      • Type: "dev", "optional", or "peer" (can be set multiple times)

      Dependency types to omit from the installation tree on disk.

      Note that these dependencies are still resolved and added to the package-lock.json or npm-shrinkwrap.json file. They are just not physically installed on disk.

      If a package type appears in both the --include and --omit lists, then it will be included.

      If the resulting omit list includes 'dev', then the NODE_ENV environment variable will be set to 'production' for all lifecycle scripts.

  ignore-scripts
      • Default: false

      • Type: Boolean

      If true, npm does not run scripts specified in package.json files.

      Note that commands explicitly intended to run a particular script, such as npm start, npm stop, npm restart,  npm  test,  and npm run-script will still run their intended script if ignore-scripts is set, but they will not run any pre- or post-scripts.

  audit
      • Default: true

      • Type: Boolean

      When  "true" submit audit reports alongside the current npm command to the default registry and all registries configured for scopes. See the documentation for npm help audit for details on what is submitted.

  bin-links
      • Default: true

      • Type: Boolean

      Tells npm to create symlinks (or .cmd shims on Windows) for package executables.

      Set to false to have it not do this. This can be used to work around the fact that some file systems don't support  symlinks, even on ostensibly Unix systems.

  fund
      • Default: true

      • Type: Boolean

      When "true" displays the message at the end of each npm install acknowledging the number of dependencies looking for funding.
      See npm help npm fund for details.

  dry-run
      • Default: false

      • Type: Boolean

      Indicates that you don't want npm to make any changes and that it should only report what it would have  done.  This  can  be passed  into any of the commands that modify your local installation, eg, install, update, dedupe, uninstall, as well as pack and publish.

      Note: This is NOT honored by other network related commands, eg dist-tags, owner, etc.

  workspace
      • Default:

      • Type: String (can be set multiple times)

      Enable running a command in the context of the configured workspaces of the current project while filtering by  running  only the workspaces defined by this configuration option.

      Valid values for the workspace config are either:

      • Workspace names

      • Path to a workspace directory

      • Path to a parent workspace directory (will result to selecting all of the nested workspaces)

      When  set  for  the  npm  init  command, this may be set to the folder of a workspace which does not yet exist, to create the folder and set it up as a brand new workspace within the project.

      This value is not exported to the environment for child processes.

  workspaces
      • Default: false

      • Type: Boolean

      Enable running a command in the context of all the configured workspaces.

      This value is not exported to the environment for child processes.
 */
/*
NPM pack configuration options:

  dry-run
      • Default: false

      • Type: Boolean

      Indicates  that  you  don't  want npm to make any changes and that it should only report what it would have done. This can be
      passed into any of the commands that modify your local installation, eg, install, update, dedupe, uninstall, as well as  pack
      and publish.

      Note: This is NOT honored by other network related commands, eg dist-tags, owner, etc.

  json
      • Default: false

      • Type: Boolean

      Whether or not to output JSON data, rather than the normal output.

      • In npm pkg set it enables parsing set values with JSON.parse() before saving them to your package.json.

      Not supported by all npm commands.

  pack-destination
      • Default: "."

      • Type: String

      Directory in which npm pack will save tarballs.

  workspace
      • Default:

      • Type: String (can be set multiple times)

      Enable  running  a command in the context of the configured workspaces of the current project while filtering by running only
      the workspaces defined by this configuration option.

      Valid values for the workspace config are either:

      • Workspace names

      • Path to a workspace directory

      • Path to a parent workspace directory (will result to selecting all of the nested workspaces)

      When set for the npm init command, this may be set to the folder of a workspace which does  not  yet  exist,  to  create  the
      folder and set it up as a brand new workspace within the project.

      This value is not exported to the environment for child processes.

  workspaces
      • Default: false

      • Type: Boolean

      Enable running a command in the context of all the configured workspaces.

      This value is not exported to the environment for child processes.  <!-- AUTOGENERATED CONFIG DESCRIPTIONS END -->

  Description
      For  anything  that's installable (that is, a package folder, tarball, tarball url, git url, name@tag, name@version, name, or
      scoped name), this command will fetch it to the cache, copy the tarball to the  current  working  directory  as  <name>-<ver‐
      sion>.tgz, and then write the filenames out to stdout.

      If the same package is specified multiple times, then the file will be overwritten the second time.

      If no arguments are supplied, then npm packs the current package folder.
 */
/*
CONFIG(7)                                                                                                                  CONFIG(7)

NAME
      config - More than you probably want to know about npm configuration

  Description
      npm gets its configuration values from the following sources, sorted by priority:

  Command Line Flags
      Putting  --foo  bar on the command line sets the foo configuration parameter to "bar".  A -- argument tells the cli parser to
      stop reading flags.  Using --flag without specifying any value will set the value to true.

      Example: --flag1 --flag2 will set both configuration parameters to true, while --flag1 --flag2 bar will set  flag1  to  true,
      and  flag2 to bar.  Finally, --flag1 --flag2 -- bar will set both configuration parameters to true, and the bar is taken as a
      command argument.

  Environment Variables
      Any environment variables that start with npm_config_ will be interpreted as a configuration parameter.  For example, putting
      npm_config_foo=bar  in your environment will set the foo configuration parameter to bar.  Any environment configurations that
      are not given a value will be given the value of true.  Config values are case-insensitive, so NPM_CONFIG_FOO=bar  will  work
      the  same.  However, please note that inside npm help scripts npm will set its own environment variables and Node will prefer
      those  lowercase versions over any uppercase ones that you might set. For details see this issue
      https://github.com/npm/npm/issues/14528.

      Notice  that  you  need to use underscores instead of dashes, so --allow-same-version would become npm_config_allow_same_ver‐
      sion=true.

  npmrc Files
      The four relevant files are:

      • per-project configuration file (/path/to/my/project/.npmrc)

      • per-user configuration file (defaults to $HOME/.npmrc; configurable via CLI option  --userconfig  or  environment  variable
        $NPM_CONFIG_USERCONFIG)

      • global  configuration  file (defaults to $PREFIX/etc/npmrc; configurable via CLI option --globalconfig or environment vari‐
        able $NPM_CONFIG_GLOBALCONFIG)

      • npm's built-in configuration file (/path/to/npm/npmrc)

      See npm help npmrc for more details.

  Default Configs
      Run npm config ls -l to see a set of configuration parameters that are internal to npm, and are defaults if nothing  else  is
      specified.

  Shorthands and Other CLI Niceties
      The  following  shorthands  are parsed on the command-line:

      • -a: --all

      • --enjoy-by: --before

      • -c: --call

      • --desc: --description

      • -f: --force

      • -g: --global

      • -L: --location

      • -d: --loglevel info

      • -s: --loglevel silent

      • --silent: --loglevel silent

      • --ddd: --loglevel silly

      • --dd: --loglevel verbose

      • --verbose: --loglevel verbose

      • -q: --loglevel warn

      • --quiet: --loglevel warn

      • -l: --long

      • -m: --message

      • --local: --no-global

      • -n: --no-yes

      • --no: --no-yes

      • -p: --parseable

      • --porcelain: --parseable

      • -C: --prefix

      • --readonly: --read-only

      • --reg: --registry

      • -S: --save

      • -B: --save-bundle

      • -D: --save-dev

      • -E: --save-exact

      • -O: --save-optional

      • -P: --save-prod

      • -?: --usage

      • -h: --usage

      • -H: --usage

      • --help: --usage

      • -v: --version

      • -w: --workspace

      • --ws: --workspaces

      • -y: --yes

      If the specified configuration param resolves unambiguously to a known configuration parameter, then it is expanded  to  that
      configuration parameter.  For example:

        npm ls --par
        # same as:
        npm ls --parseable

      If  multiple  single-character  shorthands are strung together, and the resulting combination is unambiguously not some other
      configuration param, then it is expanded to its various component pieces.  For example:

        npm ls -gpld
        # same as:
        npm ls --global --parseable --long --loglevel info

  Config Settings

  _auth
      • Default: null

      • Type: null or String

      A basic-auth string to use when authenticating against the npm registry.

      Warning: This should generally not be set via a command-line option. It is safer to use  a  registry-provided  authentication
      bearer token stored in the ~/.npmrc file by running npm login.

  access
      • Default: 'restricted' for scoped packages, 'public' for unscoped packages

      • Type: null, "restricted", or "public"

      When  publishing  scoped  packages,  the access level defaults to restricted.  If you want your scoped package to be publicly
      viewable (and installable) set --access=public. The only valid values for access are public and restricted. Unscoped packages
      always have an access level of public.

  all
      • Default: false

      • Type: Boolean

      When  running npm outdated and npm ls, setting --all will show all outdated or installed packages, rather than only those di‐
      rectly depended upon by the current project.

  allow-same-version
      • Default: false

      • Type: Boolean

      Prevents throwing an error when npm version is used to set the new version to the same value as the current version.

  audit
      • Default: true

      • Type: Boolean

      When "true" submit audit reports alongside the current npm command to the default registry and all registries configured  for
      scopes. See the documentation for npm help audit for details on what is submitted.

  audit-level
      • Default: null

      • Type: null, "info", "low", "moderate", "high", "critical", or "none"

      The minimum level of vulnerability for npm audit to exit with a non-zero exit code.

  before
      • Default: null

      • Type: null or Date

      If  passed  to  npm  install, will rebuild the npm tree such that only versions that were available on or before the --before
      time get installed. If there's no versions available for the current set of direct dependencies, the command will error.

      If the requested version is a dist-tag and the given tag does not pass the --before filter, the most recent version less than
      or equal to that tag will be used. For example, foo@latest might install foo@1.2 even though latest is 2.0.

  bin-links
      • Default: true

      • Type: Boolean

      Tells npm to create symlinks (or .cmd shims on Windows) for package executables.

      Set to false to have it not do this. This can be used to work around the fact that some file systems don't support symlinks,
      even on ostensibly Unix systems.

  browser
      • Default: OS X: "open", Windows: "start", Others: "xdg-open"

      • Type: null, Boolean, or String

      The browser that is called by npm commands to open websites.

      Set to false to suppress browser behavior and instead print urls to terminal.

      Set to true to use default system URL opener.

  ca
      • Default: null

      • Type: null or String (can be set multiple times)

      The Certificate Authority signing certificate that is trusted for SSL connections to the registry. Values should be in PEM
      format (Windows calls it "Base-64 encoded X.509 (.CER)") with newlines replaced by the string "\n". For example:

        ca="-----BEGIN CERTIFICATE-----\nXXXX\nXXXX\n-----END CERTIFICATE-----"

      Set to null to only allow "known" registrars, or to a specific CA cert to trust only that specific signing authority.

      Multiple CAs can be trusted by specifying an array of certificates:

        ca[]="..."
        ca[]="..."

      See also the strict-ssl config.

  cache
      • Default: Windows: %LocalAppData%\npm-cache, Posix: ~/.npm

      • Type: Path

      The location of npm's cache directory. See npm help npm cache

  cafile
      • Default: null

      • Type: Path

      A path to a file containing one or multiple Certificate Authority signing certificates. Similar to the ca setting, but allows
      for multiple CA's, as well as for the CA information to be stored in a file on disk.

  call
      • Default: ""

      • Type: String

      Optional companion option for npm exec, npx that allows for specifying a custom command to be run alonwith the installed
      packages.

        npm exec --package yo --package generator-node --call "yo node"

  cert
      • Default: null

      • Type: null or String

      A client certificate to pass when accessing the registry. Values should be in PEM format (Windows calls it "Base-64 encoded
      X.509 (.CER)") with newlines replaced by the string "\n". For example:

        cert="-----BEGIN CERTIFICATE-----\nXXXX\nXXXX\n-----END CERTIFICATE-----"

      It is not the path to a certificate file (and there is no "certfile" option).

  ci-name
      • Default: The name of the current CI system, or null when not on a known CI platform.

      • Type: null or String

      The name of a continuous integration system. If not set explicitly, npm will detect the current CI environment using the
      @npmcli/ci-detect http://npm.im/@npmcli/ci-detect module.

  cidr
      • Default: null

      • Type: null or String (can be set multiple times)

      This is a list of CIDR address to be used when configuring limited access tokens with the npm token create command.

  color
      • Default: true unless the NO_COLOR environ is set to something other than '0'

      • Type: "always" or Boolean

      If false, never shows colors. If "always" then always shows colors. If true, then only prints color codes for tty file de‐
      scriptors.

  commit-hooks
      • Default: true

      • Type: Boolean

      Run git commit hooks when using the npm version command.

  depth
      • Default: Infinity if --all is set, otherwise 1

      • Type: null or Number

      The depth to go when recursing packages for npm ls.

      If not set, npm ls will show only the immediate dependencies of the root project. If --all is set, then npm will show all de‐
      pendencies by default.

  description
      • Default: true

      • Type: Boolean

      Show the description in npm search

  diff
      • Default:

      • Type: String (can be set multiple times)

      Define arguments to compare in npm diff.

  diff-dst-prefix
      • Default: "b/"

      • Type: String

      Destination prefix to be used in npm diff output.

  diff-ignore-all-space
      • Default: false

      • Type: Boolean

      Ignore whitespace when comparing lines in npm diff.

  diff-name-only
      • Default: false

      • Type: Boolean

      Prints only filenames when using npm diff.

  diff-no-prefix
      • Default: false

      • Type: Boolean

      Do not show any source or destination prefix in npm diff output.

      Note: this causes npm diff to ignore the --diff-src-prefix and --diff-dst-prefix configs.

  diff-src-prefix
      • Default: "a/"

      • Type: String

      Source prefix to be used in npm diff output.

  diff-text
      • Default: false

      • Type: Boolean

      Treat all files as text in npm diff.

  diff-unified
      • Default: 3

      • Type: Number

      The number of lines of context to print in npm diff.

  dry-run
      • Default: false

      • Type: Boolean

      Indicates that you don't want npm to make any changes and that it should only report what it would have done. This can be
      passed into any of the commands that modify your local installation, eg, install, update, dedupe, uninstall, as well as pack
      and publish.

      Note: This is NOT honored by other network related commands, eg dist-tags, owner, etc.

  editor
      • Default: The EDITOR or VISUAL environment variables, or 'notepad.exe' on Windows, or 'vim' on Unix systems

      • Type: String

      The command to run for npm edit and npm config edit.

  engine-strict
      • Default: false

      • Type: Boolean

      If set to true, then npm will stubbornly refuse to install (or even consider installing) any package that claims to not be
      compatible with the current Node.js version.

      This can be overridden by setting the --force flag.

  fetch-retries
      • Default: 2

      • Type: Number

      The "retries" config for the retry module to use when fetching packages from the registry.

      npm will retry idempotent read requests to the registry in the case of network failures or 5xx HTTP errors.

  fetch-retry-factor
      • Default: 10

      • Type: Number

      The "factor" config for the retry module to use when fetching packages.

  fetch-retry-maxtimeout
      • Default: 60000 (1 minute)

      • Type: Number

      The "maxTimeout" config for the retry module to use when fetching packages.

  fetch-retry-mintimeout
      • Default: 10000 (10 seconds)

      • Type: Number

      The "minTimeout" config for the retry module to use when fetching packages.

  fetch-timeout
      • Default: 300000 (5 minutes)

      • Type: Number

      The maximum amount of time to wait for HTTP requests to complete.

  force
      • Default: false

      • Type: Boolean

      Removes various protections against unfortunate side effects, common mistakes, unnecessary performance degradation, and mali‐
      cious input.

      • Allow clobbering non-npm files in global installs.

      • Allow the npm version command to work on an unclean git repository.

      • Allow deleting the cache folder with npm cache clean.

      • Allow installing packages that have an engines declaration requiring a different version of npm.

      • Allow installing packages that have an engines declaration requiring a different version of node, even if --engine-strict
        is enabled.

      • Allow npm audit fix to install modules outside your stated dependency range (including SemVer-major changes).

      • Allow unpublishing all versions of a published package.

      • Allow conflicting peerDependencies to be installed in the root project.

      • Implicitly set --yes during npm init.

      • Allow clobbering existing values in npm pkg

      If you don't have a clear idea of what you want to do, it is strongly recommended that you do not use this option!

  foreground-scripts
      • Default: false

      • Type: Boolean

      Run all build scripts (ie, preinstall, install, and postinstall) scripts for installed packages in the foreground process,
      sharing standard input, output, and error with the main npm process.

      Note that this will generally make installs run slower, and be much noisier, but can be useful for debugging.

  format-package-lock
      • Default: true

      • Type: Boolean

      Format package-lock.json or npm-shrinkwrap.json as a human readable file.

  fund
      • Default: true

      • Type: Boolean

      When "true" displays the message at the end of each npm install acknowledging the number of dependencies looking for funding.
      See npm help npm fund for details.

  git
      • Default: "git"

      • Type: String

      The command to use for git commands. If git is installed on the computer, but is not in the PATH, then set this to the full
      path to the git binary.

  git-tag-version
      • Default: true

      • Type: Boolean

      Tag the commit when using the npm version command.

  global
      • Default: false

      • Type: Boolean

      Operates in "global" mode, so that packages are installed into the prefix folder instead of the current working directory.
      See npm help folders for more on the differences in behavior.

      • packages are installed into the {prefix}/lib/node_modules folder, instead of the current working directory.

      • bin files are linked to {prefix}/bin

      • man pages are linked to {prefix}/share/man

  global-style
      • Default: false

      • Type: Boolean

      Causes npm to install the package into your local node_modules folder with the same layout it uses with the global  node_mod‐
      ules folder. Only your direct dependencies will show in node_modules and everything they depend on will be flattened in their
      node_modules folders. This obviously will eliminate some deduping. If used with legacy-bundling, legacy-bundling will be pre‐
      ferred.

  globalconfig
      • Default: The global --prefix setting plus 'etc/npmrc'. For example, '/usr/local/etc/npmrc'

      • Type: Path

      The config file to read for global config options.

  heading
      • Default: "npm"

      • Type: String

      The string that starts all the debugging log output.

  https-proxy
      • Default: null

      • Type: null or URL

      A  proxy  to use for outgoing https requests. If the HTTPS_PROXY or https_proxy or HTTP_PROXY or http_proxy environment vari‐
      ables are set, proxy settings will be honored by the underlying make-fetch-happen library.

  if-present
      • Default: false

      • Type: Boolean

      If true, npm will not exit with an error code when run-script is invoked for a script that isn't defined in the scripts  sec‐
      tion  of  package.json.  This option can be used when it's desirable to optionally run a script when it's present and fail if
      the script fails. This is useful, for example, when running scripts that may only apply  for  some  builds  in  an  otherwise
      generic CI setup.

  ignore-scripts
      • Default: false

      • Type: Boolean

      If true, npm does not run scripts specified in package.json files.

      Note that commands explicitly intended to run a particular script, such as npm start, npm stop, npm restart, npm test, and
      npm run-script will still run their intended script if ignore-scripts is set, but they will not run any pre- or post-scripts.

  include
      • Default:

      • Type: "prod", "dev", "optional", or "peer" (can be set multiple times)

      Option that allows for defining which types of dependencies to install.

      This is the inverse of --omit=<type>.

      Dependency types specified in --include will not be omitted, regardless of the order in which omit/include are specified on
      the command-line.

  include-staged
      • Default: false

      • Type: Boolean

      Allow installing "staged" published packages, as defined by npm RFC PR #92 https://github.com/npm/rfcs/pull/92.

      This is experimental, and not implemented by the npm public registry.

  init-author-email
      • Default: ""

      • Type: String

      The value npm init should use by default for the package author's email.

  init-author-name
      • Default: ""

      • Type: String

      The value npm init should use by default for the package author's name.

  init-author-url
      • Default: ""

      • Type: "" or URL

      The value npm init should use by default for the package author's homepage.

  init-license
      • Default: "ISC"

      • Type: String

      The value npm init should use by default for the package license.

  init-module
      • Default: "~/.npm-init.js"

      • Type: Path

      A module that will be loaded by the npm init command. See the documentation for the init-package-json
      https://github.com/npm/init-package-json module for more information, or npm help init.

  init-version
      • Default: "1.0.0"

      • Type: SemVer string

      The value that npm init should use by default for the package version number, if not already set in package.json.

  json
      • Default: false

      • Type: Boolean

      Whether or not to output JSON data, rather than the normal output.

      • In npm pkg set it enables parsing set values with JSON.parse() before saving them to your package.json.

      Not supported by all npm commands.

  key
      • Default: null

      • Type: null or String

      A client key to pass when accessing the registry. Values should be in PEM format with newlines replaced by the string "\n".
      For example:

        key="-----BEGIN PRIVATE KEY-----\nXXXX\nXXXX\n-----END PRIVATE KEY-----"

      It is not the path to a key file (and there is no "keyfile" option).

  legacy-bundling
      • Default: false

      • Type: Boolean

      Causes npm to install the package such that versions of npm prior to 1.4, such as the one included with node 0.8, can install
      the package. This eliminates all automatic deduping. If used with global-style this option will be preferred.

  legacy-peer-deps
      • Default: false

      • Type: Boolean

      Causes npm to completely ignore peerDependencies when building a package tree, as in npm versions 3 through 6.

      If a package cannot be installed because of overly strict peerDependencies that collide, it provides a way to move forward
      resolving the situation.

      This differs from --omit=peer, in that --omit=peer will avoid unpacking peerDependencies on disk, but will still design a
      tree such that peerDependencies could be unpacked in a correct place.

      Use of legacy-peer-deps is not recommended, as it will not enforce the peerDependencies contract that meta-dependencies may
      rely on.

  link
      • Default: false

      • Type: Boolean

      Used with npm ls, limiting output to only those packages that are linked.

  local-address
      • Default: null

      • Type: IP Address

      The IP address of the local interface to use when making connections to the npm registry. Must be IPv4 in versions of Node
      prior to 0.12.

  location
      • Default: "user" unless --global is passed, which will also set this value to "global"

      • Type: "global", "user", or "project"

      When passed to npm config this refers to which config file to use.

  loglevel
      • Default: "notice"

      • Type: "silent", "error", "warn", "notice", "http", "timing", "info", "verbose", or "silly"

      What level of logs to report. On failure, all logs are written to npm-debug.log in the current working directory.

      Any logs of a higher level than the setting are shown. The default is "notice".

      See also the foreground-scripts config.

  logs-max
      • Default: 10

      • Type: Number

      The maximum number of log files to store.

  long
      • Default: false

      • Type: Boolean

      Show extended information in ls, search, and help-search.

  maxsockets
      • Default: 15

      • Type: Number

      The maximum number of connections to use per origin (protocol/host/port combination).

  message
      • Default: "%s"

      • Type: String

      Commit message which is used by npm version when creating version commit.

      Any "%s" in the message will be replaced with the version number.

  node-options
      • Default: null

      • Type: null or String

      Options to pass through to Node.js via the NODE_OPTIONS environment variable. This does not impact how npm itself is executed
      but it does impact how lifecycle scripts are called.

  node-version
      • Default: Node.js process.version value

      • Type: SemVer string

      The node version to use when checking a package's engines setting.

  noproxy
      • Default: The value of the NO_PROXY environment variable

      • Type: String (can be set multiple times)

      Domain extensions that should bypass any proxies.

      Also accepts a comma-delimited string.

  npm-version
      • Default: Output of npm --version

      • Type: SemVer string

      The npm version to use when checking a package's engines setting.

  offline
      • Default: false

      • Type: Boolean

      Force  offline  mode:  no  network  requests will be done during install. To allow the CLI to fill in missing cache data, see
      --prefer-offline.

  omit
      • Default: 'dev' if the NODE_ENV environment variable is set to 'production', otherwise empty.

      • Type: "dev", "optional", or "peer" (can be set multiple times)

      Dependency types to omit from the installation tree on disk.

      Note that these dependencies are still resolved and added to the package-lock.json or npm-shrinkwrap.json file. They are just
      not physically installed on disk.

      If a package type appears in both the --include and --omit lists, then it will be included.

      If the resulting omit list includes 'dev', then the NODE_ENV environment variable will be set to 'production' for all lifecy‐
      cle scripts.

  otp
      • Default: null

      • Type: null or String

      This is a one-time password from a two-factor authenticator. It's needed when publishing or changing package permissions with
      npm access.

      If  not  set, and a registry response fails with a challenge for a one-time password, npm will prompt on the command line for
      one.

  pack-destination
      • Default: "."

      • Type: String

      Directory in which npm pack will save tarballs.

  package
      • Default:

      • Type: String (can be set multiple times)

      The package to install for npm help exec

  package-lock
      • Default: true

      • Type: Boolean

      If set to false, then ignore package-lock.json files when installing. This will also  prevent  writing  package-lock.json  if
      save is true.

      When  package package-locks are disabled, automatic pruning of extraneous modules will also be disabled. To remove extraneous
      modules with package-locks disabled use npm prune.

  package-lock-only
      • Default: false

      • Type: Boolean

      If set to true, the current operation will only use the package-lock.json, ignoring node_modules.

      For update this means only the package-lock.json will be updated, instead of checking node_modules and downloading  dependen‐
      cies.

      For  list  this  means  the  output will be based on the tree described by the package-lock.json, rather than the contents of
      node_modules.

  parseable
      • Default: false

      • Type: Boolean

      Output parseable results from commands that write to standard output. For npm search, this will be tab-separated  table  for‐
      mat.

  prefer-offline
      • Default: false

      • Type: Boolean

      If true, staleness checks for cached data will be bypassed, but missing data will be requested from the server. To force full
      offline mode, use --offline.

  prefer-online
      • Default: false

      • Type: Boolean

      If true, staleness checks for cached data will be forced, making the CLI look for updates immediately even for fresh  package
      data.

  prefix
      • Default:  In global mode, the folder where the node executable is installed.  In local mode, the nearest parent folder con‐
        taining either a package.json file or a node_modules folder.

      • Type: Path

      The location to install global items. If set on the command line, then it forces non-global commands to run in the  specified
      folder.

  preid
      • Default: ""

      • Type: String

      The "prerelease identifier" to use as a prefix for the "prerelease" part of a semver. Like the rc in 1.2.0-rc.8.

  progress
      • Default: true unless running in a known CI system

      • Type: Boolean

      When set to true, npm will display a progress bar during time intensive operations, if process.stderr is a TTY.

      Set to false to suppress the progress bar.

  proxy
      • Default: null

      • Type: null, false, or URL

      A proxy to use for outgoing http requests. If the HTTP_PROXY or http_proxy environment variables are set, proxy settings will
      be honored by the underlying request library.

  read-only
      • Default: false

      • Type: Boolean

      This is used to mark a token as unable to publish when configuring limited access tokens with the npm token create command.

  rebuild-bundle
      • Default: true

      • Type: Boolean

      Rebuild bundled dependencies after installation.

  registry
      • Default: "https://registry.npmjs.org/"

      • Type: URL

      The base URL of the npm registry.

  save
      • Default: true

      • Type: Boolean

      Save installed packages to a package.json file as dependencies.

      When used with the npm rm command, removes the dependency from package.json.

  save-bundle
      • Default: false

      • Type: Boolean

      If a package would be saved at install time by the use of --save, --save-dev, or --save-optional, then also  put  it  in  the
      bundleDependencies list.

      Ignore if --save-peer is set, since peerDependencies cannot be bundled.

  save-dev
      • Default: false

      • Type: Boolean

      Save installed packages to a package.json file as devDependencies.

  save-exact
      • Default: false

      • Type: Boolean

      Dependencies  saved to package.json will be configured with an exact version rather than using npm's default semver range op‐
      erator.

  save-optional
      • Default: false

      • Type: Boolean

      Save installed packages to a package.json file as optionalDependencies.

  save-peer
      • Default: false

      • Type: Boolean

      Save installed packages. to a package.json file as peerDependencies

  save-prefix
      • Default: "^"

      • Type: String

      Configure how versions of packages installed to a package.json file via --save or --save-dev get prefixed.

      For example if a package has version 1.2.3, by default its version is set to ^1.2.3 which  allows  minor  upgrades  for  that
      package, but after npm config set save-prefix='~' it would be set to ~1.2.3 which only allows patch upgrades.

  save-prod
      • Default: false

      • Type: Boolean

      Save  installed packages into dependencies specifically. This is useful if a package already exists in devDependencies or op‐
      tionalDependencies, but you want to move it to be a non-optional production dependency.

      This is the default behavior if --save is true, and neither --save-dev or --save-optional are true.

  scope
      • Default: the scope of the current project, if any, or ""

      • Type: String

      Associate an operation with a scope for a scoped registry.

      Useful when logging in to or out of a private registry:

        # log in, linking the scope to the custom registry
        npm login --scope=@mycorp --registry=https://registry.mycorp.com

        # log out, removing the link and the auth token
        npm logout --scope=@mycorp

      This will cause @mycorp to be mapped to the registry for future installation of packages specified according to  the  pattern
      @mycorp/package.

      This will also cause npm init to create a scoped package.

        # accept all defaults, and create a package named "@foo/whatever",
        # instead of just named "whatever"
        npm init --scope=@foo --yes

  script-shell
      • Default: '/bin/sh' on POSIX systems, 'cmd.exe' on Windows

      • Type: null or String

      The shell to use for scripts run with the npm exec, npm run and npm init <pkg> commands.

  searchexclude
      • Default: ""

      • Type: String

      Space-separated options that limit the results from search.

  searchlimit
      • Default: 20

      • Type: Number

      Number of items to limit search results to. Will not apply at all to legacy searches.

  searchopts
      • Default: ""

      • Type: String

      Space-separated options that are always passed to search.

  searchstaleness
      • Default: 900

      • Type: Number

      The age of the cache, in seconds, before another registry request is made if using legacy search endpoint.

  shell
      • Default: SHELL environment variable, or "bash" on Posix, or "cmd.exe" on Windows

      • Type: String

      The shell to run for the npm explore command.

  sign-git-commit
      • Default: false

      • Type: Boolean

      If set to true, then the npm version command will commit the new package version using -S to add a signature.

      Note that git requires you to have set up GPG keys in your git configs for this to work properly.

  sign-git-tag
      • Default: false

      • Type: Boolean

      If set to true, then the npm version command will tag the version using -s to add a signature.

      Note that git requires you to have set up GPG keys in your git configs for this to work properly.

  strict-peer-deps
      • Default: false

      • Type: Boolean

      If  set to true, and --legacy-peer-deps is not set, then any conflicting peerDependencies will be treated as an install fail‐
      ure, even if npm could reasonably guess the appropriate resolution based on non-peer dependency relationships.

      By default, conflicting peerDependencies deep in the dependency graph will be resolved using the nearest non-peer  dependency
      specification, even if doing so will result in some packages receiving a peer dependency outside the range set in their pack‐
      age's peerDependencies object.

      When such and override is  performed,  a  warning  is  printed,  explaining  the  conflict  and  the  packages  involved.  If
      --strict-peer-deps is set, then this warning is treated as a failure.

  strict-ssl
      • Default: true

      • Type: Boolean

      Whether or not to do SSL key validation when making requests to the registry via https.

      See also the ca config.

  tag
      • Default: "latest"

      • Type: String

      If you ask npm to install a package and don't tell it a specific version, then it will install the specified tag.

      Also the tag that is added to the package@version specified by the npm tag command, if no explicit tag is given.

      When  used  by  the npm diff command, this is the tag used to fetch the tarball that will be compared with the local files by
      default.

  tag-version-prefix
      • Default: "v"

      • Type: String

      If set, alters the prefix used when tagging a new version when performing a version increment using  npm-version.  To  remove
      the prefix altogether, set it to the empty string: "".

      Because  other tools may rely on the convention that npm version tags look like v1.0.0, only use this property if it is abso‐
      lutely necessary. In particular, use care when overriding this setting for public packages.

  timing
      • Default: false

      • Type: Boolean

      If true, writes an npm-debug log to _logs and timing information to _timing.json, both in your cache,  even  if  the  command
      completes successfully. _timing.json is a newline delimited list of JSON objects.

      You can quickly view it with this json https://npm.im/json command line: npm exec -- json -g < ~/.npm/_timing.json.

  umask
      • Default: 0

      • Type: Octal numeric string in range 0000..0777 (0..511)

      The "umask" value to use when setting the file creation mode on files and folders.

      Folders  and  executables  are  given  a mode which is 0o777 masked against this value. Other files are given a mode which is
      0o666 masked against this value.

      Note that the underlying system will also apply its own umask value to files and folders that are created, and npm  does  not
      circumvent this, but rather adds the --umask config to it.

      Thus,  the effective default umask value on most POSIX systems is 0o22, meaning that folders and executables are created with
      a mode of 0o755 and other files are created with a mode of 0o644.

  unicode
      • Default: false on windows, true on mac/unix systems with a unicode locale, as defined by the LC_ALL, LC_CTYPE, or LANG  en‐
        vironment variables.

      • Type: Boolean

      When  set  to  true,  npm uses unicode characters in the tree output. When false, it uses ascii characters instead of unicode
      glyphs.

  update-notifier
      • Default: true

      • Type: Boolean

      Set to false to suppress the update notification when using an older version of npm than the latest.

  usage
      • Default: false

      • Type: Boolean

      Show short usage output about the command specified.

  user-agent
      • Default: "npm/{npm-version} node/{node-version} {platform} {arch} workspaces/{workspaces} {ci}"

      • Type: String

      Sets the User-Agent request header. The following fields are replaced with their actual counterparts:

      • {npm-version} - The npm version in use

      • {node-version} - The Node.js version in use

      • {platform} - The value of process.platform

      • {arch} - The value of process.arch

      • {workspaces} - Set to true if the workspaces or workspace options are set.

      • {ci} - The value of the ci-name config, if set, prefixed with ci/, or an empty string if ci-name is empty.

  userconfig
      • Default: "~/.npmrc"

      • Type: Path

      The location of user-level configuration settings.

      This may be overridden by the npm_config_userconfig environment variable or the --userconfig command line option, but may not
      be overridden by settings in the globalconfig file.

  version
      • Default: false

      • Type: Boolean

      If true, output the npm version and exit successfully.

      Only relevant when specified explicitly on the command line.

  versions
      • Default: false

      • Type: Boolean

      If  true,  output  the  npm version as well as node's process.versions map and the version in the current working directory's
      package.json file if one exists, and exit successfully.

      Only relevant when specified explicitly on the command line.

  viewer
      • Default: "man" on Posix, "browser" on Windows

      • Type: String

      The program to use to view help content.

      Set to "browser" to view html help content in the default web browser.

  which
      • Default: null

      • Type: null or Number

      If there are multiple funding sources, which 1-indexed source URL to open.

  workspace
      • Default:

      • Type: String (can be set multiple times)

      Enable running a command in the context of the configured workspaces of the current project while filtering by  running  only
      the workspaces defined by this configuration option.

      Valid values for the workspace config are either:

      • Workspace names

      • Path to a workspace directory

      • Path to a parent workspace directory (will result to selecting all of the nested workspaces)

      When  set  for  the  npm  init  command, this may be set to the folder of a workspace which does not yet exist, to create the
      folder and set it up as a brand new workspace within the project.

      This value is not exported to the environment for child processes.

  workspaces
      • Default: false

      • Type: Boolean

      Enable running a command in the context of all the configured workspaces.

      This value is not exported to the environment for child processes.

  yes
      • Default: null

      • Type: null or Boolean

      Automatically answer "yes" to any prompts that npm might print on the command line.

  also
      • Default: null

      • Type: null, "dev", or "development"

      • DEPRECATED: Please use --include=dev instead.

      When set to dev or development, this is an alias for --include=dev.

  auth-type
      • Default: "legacy"

      • Type: "legacy", "sso", "saml", or "oauth"

      • DEPRECATED: This method of SSO/SAML/OAuth is deprecated and will be removed  in  a  future  version  of  npm  in  favor  of
        web-based login.

      What authentication strategy to use with adduser/login.

  cache-max
      • Default: Infinity

      • Type: Number

      • DEPRECATED: This option has been deprecated in favor of --prefer-online

      --cache-max=0 is an alias for --prefer-online

  cache-min
      • Default: 0

      • Type: Number

      • DEPRECATED: This option has been deprecated in favor of --prefer-offline.

      --cache-min=9999 (or bigger) is an alias for --prefer-offline.

  dev
      • Default: false

      • Type: Boolean

      • DEPRECATED: Please use --include=dev instead.

      Alias for --include=dev.

  init.author.email
      • Default: ""

      • Type: String

      • DEPRECATED: Use --init-author-email instead.

      Alias for --init-author-email

  init.author.name
      • Default: ""

      • Type: String

      • DEPRECATED: Use --init-author-name instead.

      Alias for --init-author-name

  init.author.url
      • Default: ""

      • Type: "" or URL

      • DEPRECATED: Use --init-author-url instead.

      Alias for --init-author-url

  init.license
      • Default: "ISC"

      • Type: String

      • DEPRECATED: Use --init-license instead.

      Alias for --init-license

  init.module
      • Default: "~/.npm-init.js"

      • Type: Path

      • DEPRECATED: Use --init-module instead.

      Alias for --init-module

  init.version
      • Default: "1.0.0"

      • Type: SemVer string

      • DEPRECATED: Use --init-version instead.

      Alias for --init-version

  only
      • Default: null

      • Type: null, "prod", or "production"

      • DEPRECATED: Use --omit=dev to omit dev dependencies from the install.

      When set to prod or production, this is an alias for --omit=dev.

  optional
      • Default: null

      • Type: null or Boolean

      • DEPRECATED: Use --omit=optional to exclude optional dependencies, or --include=optional to include them.

      Default value does install optional deps unless otherwise omitted.

      Alias for --include=optional or --omit=optional

  production
      • Default: null

      • Type: null or Boolean

      • DEPRECATED: Use --omit=dev instead.

      Alias for --omit=dev

  shrinkwrap
      • Default: true

      • Type: Boolean

      • DEPRECATED: Use the --package-lock setting instead.

      Alias for --package-lock

  sso-poll-frequency
      • Default: 500

      • Type: Number

      • DEPRECATED:  The  --auth-type method of SSO/SAML/OAuth will be removed in a future version of npm in favor of web-based lo‐
        gin.

      When used with SSO-enabled auth-types, configures how regularly the registry should be polled while the  user  is  completing
      authentication.

  sso-type
      • Default: "oauth"

      • Type: null, "oauth", or "saml"

      • DEPRECATED:  The  --auth-type method of SSO/SAML/OAuth will be removed in a future version of npm in favor of web-based lo‐
        gin.

      If --auth-type=sso, the type of SSO type to use.

  tmp
      • Default: The value returned by the Node.js os.tmpdir() method https://nodejs.org/api/os.html#os_os_tmpdir

      • Type: Path

      • DEPRECATED: This setting is no longer used. npm stores temporary files in a special location in the  cache,  and  they  are
        managed by cacache http://npm.im/cacache.

      Historically, the location where temporary files were stored. No longer relevant.
 */
