# NPM-Backup: A NPM Package Backup Tool

NPM-Backup is a CLI utility to create local tarballs of NPM packages for offline installations with all dependencies.

## Install

```bash
npm install --global https://github.com/nyctfall/npm-backup/tarball/v0.1.0
```

## Usage

To create a local package backup with all of the package's production dependencies:

```bash
npm-backup --save-prod vite # shorthand: -P
```

To create a local package backup with different configurations of the package's production, development, optional, and peer dependencies:

```bash
npm-backup -D typescript # bundles prod and dev deps in tarball
npm-backup -O typescript # bundles prod, dev, and options deps in tarball
npm-backup --save-peer typescript # bundles prod and peer deps in tarball
npm-backup -B typescript # bundles _ONLY_ bundled deps in tarball, same as npm pack
```

Most of the flags from `npm install` (`--omit`, `--save-exact`, etc.), will bundle the package tarball with the same dependencies that NPM would install when passed those options.

For full list of options and functionality, run:

```bash
npm-backup --help
```

## About

NPM-Backup was created because the native NPM package cache [`_cacache`](https://docs.npmjs.com/cli/v9/commands/npm-cache#a-note-about-the-caches-design) "should not be relied upon as a persistent and reliable data store for package data", and the [`npm pack`](https://docs.npmjs.com/cli/v9/commands/npm-pack) command _only_ creates an installable package tarball of just the package, and no dependencies besides [`bundleDependencies`](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#bundledependencies).

So using `npm pack vite` to make a local package tarball into `vite-4.0.0.tgz`, and then install it with `npm install vite-4.0.0.tgz` does not make a complete install like `npm install vite` would!

Because `npm pack` doesn't install any dependencies except those listed as `bundleDependencies` in the package.json, all needed dependencies need to be manually added to the `bundleDependencies`. So this is what NPM-Backup does.

- Fetch target package `vite` and needed dependencies from NPM registry by using npm to install vite
- Dependencies have to be installed in the package directory's `node_modules`, manually added to the `bundleDependencies` list in the package's `package.json`, and then bundled together into a tarball by `npm pack`.

## Alternatives

This helper tool is intended for primarily for `npm`, because NPM's `_cacache` package cache is not permanent and should not be relied on, even when using `--prefer-offline` or `--offline`. Yarn pkg and PNPM are much better solutions in this regard, as they have permanent caches that will be consistently available. Using a local package registry server is another possible solution depending on your needs.
