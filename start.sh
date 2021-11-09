#!/bin/bash

dirName="$(tr [A-Z] [a-z] <<< "${PWD##*/}")"
echo "Stopping container if already running..."
docker stop "${dirName//_}_vw_1"

IP=`hostname -I | awk '{ print $1 }'`

startOptions=""
while getopts "h:YyNnIi" options
do
	case $options in
			h ) IP=$OPTARG;;
		[Yy]* ) startOptions="y";;
		[Nn]* ) startOptions="n";;
		[Ii]* ) startOptions="i";;
	esac
done

chmod 777 -R ./docker/run.sh

if [ "$startOptions" == "i" ] || [ ! -f ./view_built ]; then
	IP="$IP" docker-compose up --build
else
	IP="$IP" docker-compose up -d --build
	echo "View is being served in the background on port 8081."
	while true; do
		case $startOptions in
			[Yy]* ) docker exec -it "${dirName//_}_vw_1" bash; break;;
			[Nn]* ) break;;
				* ) read -p "Do you wish to enter the container?(y/n)" startOptions;;
		esac
	done
fi