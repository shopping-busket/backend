#!/bin/bash

# (c) Busch Ilja: Simple bash script to pull projects, build frontend and copy it to the right place (for Busket)
# Following directory structure is expected:
# backend/
#  ↳ update.sh
# web/
cd ..

pull() {
  echo "Pulling $1..."
  if cd "$1" || exit && git pull; then
    echo "git pull $1: OK"
    cd ..
  else
    echo "git pull $1: Failed!"
    exit
  fi
}

compile_frontend() {
  echo "Compiling frontend..."
  (
    cd "web" || exit
    rm -rf "dist/"*
    yarn build
  )
}

flush_copy_frontend() {
  pwd
  echo "Deleting all files in backend/public"
  rm -rf "backend/public/"*

  echo "Copying compiled frontend to backend's public dir"
  cp -r "web/dist/"* "backend/public/"
}

pull "backend"
pull "web"
compile_frontend
flush_copy_frontend
