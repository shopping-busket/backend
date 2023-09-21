#!/bin/bash

# (c) Busch Ilja: Simple bash script to pull projects, build frontend and copy it to the right place (for Busket)
# Following directory structure is expected:
# backend/
#  ↳ update.sh
# web/

COLOR_CYAN="\u001b[38;5;4m"
COLOR_WARN="\u001b[38;5;220m"
COLOR_ERROR="\u001b[38;5;124m"
COLOR_RESET="\u001b[0m"
TAG="${COLOR_CYAN}[update.sh]$COLOR_RESET"

cd "${0%/*}" || fatal "Failed to cd into script dir!"
cd ..

if [ "$(id -u)" -eq 0 ]; then
  echo -e "$TAG ${COLOR_WARN}WARNING: This program shall not be run with root. Exiting!$COLOR_RESET"
  exit 2
fi

PROC=$$
trap "exit 1" SIGUSR1
fatal() {
  echo -e "$TAG ${COLOR_ERROR}Fatal: $*${COLOR_RESET}" >&2
  kill -10 $PROC
}

pull() {
  echo -e "$TAG Pulling $1..."
  if cd "$1" || fatal "cd $1 failed!" && git pull --recurse-submodules; then
    echo -e "$TAG git pull --recurse-submodules $1: OK"
    cd ..
  else
    fatal "git pull --recurse-submodules $1: Failed!"
  fi
}

compile_frontend() {
  echo -e "$TAG Compiling frontend..."
  (
    cd "web" || fatal "Failed to cd into web"
    rm -rf "dist/"*
    if ! yarn build; then
      fatal "Failed to compile frontend!"
    fi
  )
}

flush_copy_frontend() {
  echo -e "$TAG Deleting all files in backend/public"
  rm -rf "backend/public/"*

  echo -e "$TAG Copying compiled frontend to backend's public dir"
  cp -r "web/dist/"* "backend/public/"
}

compile_backend() {
  echo -e "$TAG Compiling backend..."
  (
    cd "backend" || fatal "Failed to cd into backend!"
    if ! yarn compile; then
      fatal "Failed to compile backend!"
    fi
  )
}

copy_error_pages() {
  echo -e "$TAG Enter password for action: copy nginx-error-pages to /home/www/hosts/busket.bux.at/"
  sudo cp -r "nginx-error-pages/" "/home/www/hosts/busket.bux.at/"
}

pull "backend"
pull "web"
compile_frontend
flush_copy_frontend
compile_backend
copy_error_pages

echo -e "$TAG Done! Enter password to start via systemctl"
sudo systemctl restart busket
echo -e "$TAG Restartet Busket service. Busket will be back online with the new updates in a few minutes!"
