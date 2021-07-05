# view build 

FROM node:14-slim

RUN apt-get update && apt-get install python \
					build-essential -y
RUN npm install gulp-cli -g
RUN npx -p touch nodetouch gulpfile.js

RUN mkdir -p /app/view
EXPOSE 8081
WORKDIR /app/view

CMD ["./set-docker-env.sh"]