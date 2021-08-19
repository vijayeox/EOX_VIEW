#!/bin/sh

chmod 777 /app/api/v1
chmod 777 -R /app/api/v1/data
chmod 777 -R /app/clients
chmod 777 /app/view/apps
chmod 777 -R /app/view/bos
chmod 777 -R /app/view/build.sh
chmod 777 -R /app/view/clean.sh

if [ "$IP" ]
then
	echo $IP

	cp ./bos/src/client/local.js.example ./bos/src/client/local.js
	cp ./bos/src/osjs-server/.env.example ./bos/src/osjs-server/.env
	cp ./bos/src/server/local.js.example ./bos/src/server/local.js

	sed -ri -e "s/([0-9]{1,3}\.){3}[0-9]{1,3}/${IP}/" ./bos/src/osjs-server/.env
	sed -ri -e "s/([0-9]{1,3}\.){3}[0-9]{1,3}:8080/${IP}:8080/" ./bos/src/server/local.js

	if [ ! -e ./view_built ]; then
		ls ./view_built >> /dev/null 2>&1 && echo "Starting view" || (echo "Building view" && ./build.sh gui && ./build.sh iconpacks && ./build.sh themes && ./build.sh apps Admin,Announcements,Preferences && ./build.sh bos && touch ./view_built)
		touch ./view_built
	fi

fi
if [ -e ./view_built ]; then
	npm run serve
	# tail -f /dev/null
fi