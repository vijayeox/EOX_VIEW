# view build 

FROM node:14-slim
USER root
RUN apt-get update && apt-get install python build-essential -y
RUN npm install gulp-cli -g
RUN npm i -g npm
#RUN npm i -g webpack-cli
RUN npx -p touch nodetouch gulpfile.js
#ENV NODE_ENV=production
RUN mkdir -p /app/view
EXPOSE 8081
WORKDIR /app/view

CMD ["./docker/run.sh"]