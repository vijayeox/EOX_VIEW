#!/bin/bash
IP=`hostname -I | awk '{ print $1 }'`
chmod +x ./docker/run_repo.sh

docker run -it -v "${PWD}/..:/app" -e host=$IP -p 8081:8081 repo.eoxvantage.com/eox_3.x_view_appbuilder bash




