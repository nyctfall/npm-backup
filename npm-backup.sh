#! /bin/bash

node --version
npm --version


# @TODO
  # Arguments:
  # MVP:
    # NPM pkgs
    # target NPM pkg backup output dir
    # deps to backup all or a mix of {production|development|optional|peer}
    # version to get, eg: @ latest, or a list of versions to get
  # 
  # Extra:
    # multi-pkg backups, with many pkgs's deps installed and deduped
    # chronlogical acrhive mode that backs up all versions {major.minor.patch}
  # 
  # Run:
  # sanitize user input:
    # remove ALL characters that aren't used on NPM
    # only allow: '@', '/', '-', A-Z, a-z, and 0-9
  # 
  # get user confimation of desired pkgs:
    # use NPM search for every string arg, to prevent misspelling
    # use NPM view to confirm properly spelled pkgs
  # 
  # create tmp dir for NPM pkg installs
    # mkdir
    # cd into dir
    # npm install using --global-style so the deps will be in the pkgs's dir in node_modules
  # 
  # edit package.json files for every pkg to add all {production|optional|development} deps to bundeledDependencies field:
    # use JSON.parse() to get deps
    # edit object to add props
    # use JSON.stringify() to rewrite package.json file
  # 
  # make offline NPM pkg backup:
    # use npm pack, adds pkg to NPM cache
    # OR use tar -cwzvf /path/to/bkup/dir NPM-pkg-dir
      # -z is to select gzip compression
      # this doesn't add pkg to NPM cache
  #
  # clean up tmp dir and move pkg backups to target dir:
    # rm tmp npm install dir
    # mv pkg backups to target dir

echo "$@"
echo "$?"