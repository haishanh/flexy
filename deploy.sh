#!/bin/bash
# haishanh

# a roughly written script help deploying
# contents to github pages
# actually not restrict to github pages

SUBDIR=$(pwd)
DIR=/tmp/${SUBDIR}/.deploy_git
GIT=git
BNAME=$(basename $0)

die()
{
  echo "$@"
  exit 1
}

setup()
{
  mkdir -p $DIR || die "Not able to create dir $DIR"
  cd $DIR
  echo "placeholder" > placeholder
  git init
  $GIT add -A .
  $GIT commit -m "First commit"
  cd -
}

push()
{
  cd $DIR
  $GIT add -A .
  now=$(date +"%Y/%m/%d %H:%M")
  $GIT commit -m "Update $now"
  $GIT push -u $REMOTE HEAD:$BRANCH --force
  cd -
}

empty()
{
  cd $DIR

  # remove every indexed entries recursively
  $GIT rm -r .

  cd -
}

usage()
{
  cat <<EOF
Usage:

  $BNAME [<public_dir>] [<remote_url>] [<remote_branch>]

  Where <public_dir> is the directory where files to be deployed reside
                     default to "public"

        <remote_url> is the url/name of the remote repository
                     default to "origin"

        <remote_branch> is the target remote branch name
                        default to "gh-pages"

EOF

  exit 0
}

### MAIN ###

PUBLIC="${1:-public}"
[ $PUBLIC == "help" ] && usage
[ ! -d $PUBLIC ] && die "Dir $PUBLIC not found"

REMOTE="${2:-origin}"
BRANCH="${3:-gh-pages}"

# if deploy directory is not exist, setup
[ ! -d $DIR ] && setup

# clean deploy directory
empty


# copy files to be deployed to the deploy dir
cp -r $PUBLIC/* $DIR

# push
push
