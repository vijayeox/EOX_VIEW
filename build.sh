#!/bin/bash

APPS="apps"
BOS="bos"
GUI="gui"
ICON_PACKS="iconpacks"
THEMES="themes"
BUID_GUI=false
BUILD_ICON_PACKS=false
BUILD_THEMES=false
BUILD_BOS=false
BUILD_APPS=false
BUILD_ALL=true
RUN_INSTALL=true
declare -a APPS_TO_BUILD

build_projects(){
    if [ -d "$1" ]; then
        cd $1
        echo $#
        if [ "$#" -gt 1 ]; then
            shift
            while [ "$1" != "" ] ; do
                build_project $(echo $1 | xargs)
                shift
            done
        else    
            for D in $(find . -mindepth 1 -maxdepth 1 -type d) ; do
                build_project $D
            done
        fi    
        cd ..
    fi
}
build_project() {
    if [ -d "$1" ]; then
        echo "Building $1 ...";
        cd $1
        if [ "$RUN_INSTALL" = true ] ; then
            npm install
            #npm audit fix
        fi    
        #npm run build --prod
        npm run build
        cd ..
    fi 
}
usage() {
    echo "npm run clean - to clean the dist folders";
    echo "npm run build [-- options] - to build all packages";
    echo "npm run build-bos [-- options] - to build only bos";
    echo "npm run build-gui [-- options] - to build only gui";
    echo "npx kendo-ui-license activate";
    echo "npm run build-iconpacks [-- options] - to build only iconpacks";
    echo "npm run build-themes [-- options] - to build only themes";
    echo "npm run build-apps -- [\"<app names>\"] [options]  - to build apps. Optionally comma separated list of App names can be provided";
    echo "options: (Optional)";
    echo "   noinstall - do not run npm install";
}

while [ "$1" != "" ]; do
    case $1 in
        gui )           BUILD_GUI=true
                        BUILD_ALL=false
                        ;;
        bos )           BUILD_BOS=true
                        BUILD_ALL=false
                        ;;
        iconpacks )     BUILD_ICON_PACKS=true
                        BUILD_ALL=false
                        ;;
        themes )        BUILD_THEMES=true
                        BUILD_ALL=false
                        ;;
        apps )          BUILD_APPS=true
                        BUILD_ALL=false
                        if [ -n "$2" ] ; then
                            IFS=',' read -a APPS_TO_BUILD <<< $2 
                            shift
                        fi
                        ;;
        noinstall )     RUN_INSTALL=false
                        ;;
        -h | --help )   usage
                        exit
                        ;;
    esac
    shift
done
npm install
if [ "$BUILD_GUI" = true ] || [ "$BUILD_ALL" = true ] ; then
    build_project $GUI
fi
if [ "$BUILD_APPS" = true ] || [ "$BUILD_ALL" = true ] ; then
    if [ ${#APPS_TO_BUILD[@]} -eq 0 ]; then
        build_projects $APPS
    else    
        build_projects $APPS "${APPS_TO_BUILD[@]}"
    fi
fi
if [ "$BUILD_ICON_PACKS" = true ] || [ "$BUILD_ALL" = true ] ; then
    build_projects $ICON_PACKS
fi
if [ "$BUILD_THEMES" = true ] || [ "$BUILD_ALL" = true ] ; then
    build_projects $THEMES
fi
if [ "$BUILD_BOS" = true ] || [ "$BUILD_ALL" = true ] ; then
    build_project $BOS
    cd $BOS
    npm run package:discover --relative
    cd ..
fi