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

cd "${0%/*}" || exit 1
cd ..

if [ "$(id -u)" -eq 0 ]; then
  echo -e "$TAG ${COLOR_WARN}WARNING: This program shall not be run with root. Exiting!$COLOR_RESET"
  exit 2
fi

pull() {
  echo -e "$TAG Pulling $1..."
  if cd "$1" || exit 1 && git pull; then
    echo -e "$TAG git pull $1: OK"
    cd ..
  else
    echo -e "$TAG git pull $1: Failed!"
    exit 1
  fi
}

compile_frontend() {
  echo "Compiling frontend..."
  (
    cd "web" || exit 1
    rm -rf "dist/"*
    if ! yarn build; then
      echo -e "${COLOR_ERROR}Error: Failed to compile frontend!${COLOR_RESET}"
      exit 1
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
    cd "backend" || exit 1
    if ! yarn compile; then
      echo -e "${COLOR_ERROR}Error: Failed to compile backend!${COLOR_RESET}"
      exit 1
    fi
  )
}

pull "backend"
pull "web"
compile_frontend
flush_copy_frontend
compile_backend

echo -e "$TAG Done! Enter password to start via systemctl"
sudo systemctl restart busket
echo -e "$TAG Restartet Busket service. Busket will be back online with the new updates in a few minutes!"
