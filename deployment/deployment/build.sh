# script to package oxzion3.0 to production build
#!/bin/bash
# exit when any command fails
#set -e
#trap 'echo "\"${BASH_COMMAND}\" command failed with exit code $?."' EXIT
#going back to oxzion3.0 root directory
start_time="$(date +%s)"
cd ../
#Defining variables for later use
#pass second parameter as server u want to build for example abc@xyz.com or abc@1.1.1.1
SERVER=${2}
#pass third parameter as the path to the identity file(pem/ppk) in your local system.
PEM=${3}
VIEWENTRYPOINT=${4}
OXHOME=${PWD}
RED="\e[91m"
GREEN="\e[92m"
BLUE="\e[34m"
YELLOW="\e[93m"
MAGENTA="\e[35m"
BLUEBG="\e[44m"
CYAN="\e[96m"
BLINK="\e[5m"
INVERT="\e[7m"
RESET="\e[0m"

#help function to print help message
buildhelp()
{
    echo -e "1.  view            -${YELLOW}For packaging UI/View.${RESET}"
    echo -e "1.  view2            -${YELLOW}For packaging UI/View2.${RESET}"
    
}
#checking if no arguments passed. Give error and exit.
if [ $# -eq 0 ] ;
#if [ -z "$1" ] || [ -z "$2" ];
then
    echo -e "${RED}ERROR: argument missing.${RESET}"
    echo -e "$0 : needs 3 arguments to start."
    echo -e "For example type \n$ ${GREEN}build.sh calendar${YELLOW}(build option) ${GREEN}abc@xyz.com${YELLOW}(server name){GREEN}~/.ssh/abc.pem${YELLOW}(identity file path)${RESET}.\nSee build option list below."
    echo -e "Type '$0 --help' or '$0 -h' for more information."
    echo -e "${BLUEBG}Argument list:${RESET}"
    buildhelp
    exit 0
fi
#writing functions for different tasks
#function checking exiting build dir and deleting it
check_dir()
{
cd ${OXHOME}
if [ -d "./build" ] ;
then
    echo -e "${RED}Directory build exist!${RESET}"
    echo -e "${YELLOW}Deleting existing build folder to avoid conflict...${RESET}"    
    rm -Rf build
fi
}
package()
{
    #going back to /build directory
    cd ${OXHOME}/build
    # zip the contents of the build folder excluding node_modules
    echo -e "${YELLOW}${BLINK}Packaging /build to build.zip${RESET}"
    if [ -e "../build.zip" ] ;
    then
    	echo -e "${RED}'build.zip' exist! Removing it to avoid conflict.${RESET}"
        rm ../build.zip
    fi
    zip -ry ../build.zip . 
    echo -e "${GREEN}Packaging Complete :)${RESET}"
    #Doing secure copy to dev3 server
    cd ${OXHOME}
    echo -e "${YELLOW}Now Copying ${RED}build.zip${YELLOW} to $SERVER..${RESET}"
    ssh -i ${PEM} $SERVER ' mkdir -p oxzion3.0/deployment ;'
    scp -i ${PEM} build.zip $SERVER:oxzion3.0
    echo -e "${YELLOW}Copying ${RED}build.zip${YELLOW} to $SERVER completed successfully!${RESET}"
    echo -e "${GREEN}Build Completed on ${YELLOW}`date +%d-%m-%y` at `date +%H:%M:%S` Hours${RESET}"        
}
view()
{   
    cd ${OXHOME}
    echo -e "${YELLOW}Creating directory /build/view...${RESET}"
    echo -e "${YELLOW}Build UI/view${RESET}"
    echo -e "${YELLOW}Setting up env files${RESET}"
    scp -i ${PEM} -r ${SERVER}:env/view/* ./
    docker run -t -v ${PWD}:/app/view view ./dockerbuild.sh
    echo -e "${GREEN}Building UI/view Completed!${RESET}"
    #copy contents of view to build
    mkdir -p build/view
    echo -e "${YELLOW}Copying View to build folder. Please wait this may take sometime....${RESET}"
    rsync -rl --exclude=node_modules --exclude=build ${OXHOME}/ ${OXHOME}/build/view/
    mkdir -p ${OXHOME}/build/view/bos/node_modules
    rsync -rl --delete ${OXHOME}/bos/node_modules/ ${OXHOME}/build/view/bos/node_modules/
    rsync -rl --delete ${OXHOME}/gui/node_modules/ ${OXHOME}/build/view/gui/node_modules/
    rsync -rl --delete ${OXHOME}/node_modules/ ${OXHOME}/build/view/node_modules/
    echo -e "${GREEN}Copying View Completed!${RESET}"
    #building UI/view folder
    
}
view2()
{   
    cd ${OXHOME}
    echo -e "${YELLOW}Creating directory /build/view...${RESET}"
    cd view
    echo -e "${YELLOW}Build UI/view${RESET}"
    echo -e "${YELLOW}Setting up env files${RESET}"
    scp -i ${PEM} -r ${SERVER}:env/view2/* ./
    docker run -t -v ${PWD}/..:/app view ./dockerbuild.sh
    echo -e "${GREEN}Building UI/view Completed!${RESET}"
    cd ..
    #copy contents of view to build
    mkdir -p build/view2
    echo -e "${YELLOW}Copying View to build folder. Please wait this may take sometime....${RESET}"
    rsync -rl --exclude=node_modules ./view ./build/
    mkdir -p ./build/view2/bos/node_modules
    rsync -rl --delete ./view/bos/node_modules/ ./build/view2/bos/node_modules/
    rsync -rl --delete ./view/gui/node_modules/ ./build/view2/gui/node_modules/
    rsync -rl --delete ./view/node_modules/ ./build/view2/node_modules/
    echo -e "${GREEN}Copying View Completed!${RESET}"
    #building UI/view folder
    
}
#looping through case from arguments passed
for i in $@
do
    case $i in
        view)
                echo -e "Starting script ${INVERT}$0${RESET}...with ${MAGENTA}$@${RESET} as parameters"                
                check_dir
                view
                package
                break ;;
        view2)
                echo -e "Starting script ${INVERT}$0${RESET}...with ${MAGENTA}$@${RESET} as parameters"
                check_dir
                view2
                package
                break ;;
        --help | -h)
                echo -e "${BLINK}${CYAN}███████╗ ██████╗ ██╗  ██╗    ██████╗ ██╗   ██╗██╗██╗     ██████╗ 
██╔════╝██╔═══██╗╚██╗██╔╝    ██╔══██╗██║   ██║██║██║     ██╔══██╗
█████╗  ██║   ██║ ╚███╔╝     ██████╔╝██║   ██║██║██║     ██║  ██║
██╔══╝  ██║   ██║ ██╔██╗     ██╔══██╗██║   ██║██║██║     ██║  ██║
███████╗╚██████╔╝██╔╝ ██╗    ██████╔╝╚██████╔╝██║███████╗██████╔╝
╚══════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ 
                                                                 ${RESET}"
                echo -e "This script is made to package oxzion3.0 to production build." 
                echo -e "This script takes 3 arguments to build oxzion-3.0.\nFirst the ${YELLOW}Build Option${RESET} Second the ${YELLOW}Server hostname${RESET} and third the${YELLOW}IdentityFile Path$RESET"
                echo -e "For example type \n$ ${GREEN}build.sh calendar$YELLOW(build option) ${GREEN}abc@xyz.com$YELLOW(server name)${GREEN} ~/.ssh/abc.pem${YELLOW}(identity file path)${RESET}"
                echo -e "For argument list type ${GREEN}'$0 list'${MAGENTA} as arguments${RESET}."
                break ;;
        --list | -l)
                buildhelp
                break ;;
        setup)  
                while true; do
                    echo -e "${RED}Warning! Only use for Fresh Setup, might break the server $SERVER!${RESET}"
                    read yn
                    case $yn in
                        [Yy]* ) scp -i ${PEM} deployment/freshsetup.sh $SERVER:oxzion3.0/deployment
                                ssh -i ${PEM} $SERVER 'sudo bash oxzion3.0/deployment/freshsetup.sh ;'
                                break;;
                        [Nn]* ) echo "Ok bye! ;)"
                                exit;;
                        * ) echo "Please type 'Yes' or 'No'.";;
                    esac
                done
                break ;;
        package)
                echo -e "Starting script ${INVERT}$0${RESET}...with ${MAGENTA}$@${RESET} as parameters"
                package
                break ;;
        deploy)
                ssh -i ${PEM} $SERVER ' mkdir -p oxzion3.0/deployment ;'
                scp -i ${PEM} deployment/deploy.sh $SERVER:oxzion3.0/deployment
                ssh -i ${PEM} $SERVER 'cd oxzion3.0/deployment ; sudo bash deploy.sh ;'
                break ;;
        clean)
                while true; do
                    echo -e "${RED}Warning! Are you sure you want to clean the server $SERVER?${RESET}"
                    read yn
                    case $yn in
                        [Yy]* ) echo -e "${YELLOW}Started Cleaning server $SERVER${RESET}"
                                ssh -i ${PEM} $SERVER ' rm -Rf oxzion3.0 ;'
                                ssh -i ${PEM} $SERVER ' mkdir -p oxzion3.0/deployment ;'
                                echo -e "${GREEN}Cleaning server Completed!${RESET}"
                                break;;
                        [Nn]* ) echo "Ok bye! ;)"
                                exit;;
                        * ) echo "Please type 'Yes' or 'No'.";;
                    esac
                done
                break ;;
                
        *)
                echo -e "${RED}Error : Wrong build option ${YELLOW}'$i'${RESET}"
                echo -e "Type '$0 --help' or '$0 -h' for more information."
                break ;;
    esac
done
finish_time="$(date +%s)"
min="$(( $((finish_time - start_time)) /60 ))"
sec="$(( $((finish_time - start_time)) %60 ))"
echo "Time elapsed $min mins and $sec secs."
