#!/bin/bash
clean_projects(){
    clean_project $1
    cd $1
    for D in $(find . -mindepth 1 -maxdepth 1 -type d) ; do
        clean_project $D
    done
    cd ..
}
clean_project() {
    echo "Cleaning $1 ...";
    cd $1
    rm -Rf dist
    # rm -Rf node_modules
    rm -f package-lock.json
    cd ..
}
GUI="gui"
APPS="apps"
BOS="bos"
ICON_PACKS="iconpacks"
THEMES="themes"

clean_projects $GUI
clean_projects $APPS
clean_projects $ICON_PACKS
clean_projects $THEMES
clean_project $BOS
