FROM node:15.10.0-alpine3.10

# environment variables
ENV APP_PORT=4000 \
    DATABASE=mentorApi \
    DATABASE_USERNAME=root \
    DATABASE_PASSWORD=123456 \
    DATABASE_HOST=localhost \
    API_PATH=http://localhost:4000 \
    DASHBOARD_UI_PATH=http://localhost:8080 \
    EMAIL_HOST=smtp.gmail.com \
    EMAIL_PORT=465 \
    EMAIL_SECURE=true \
    EMAIL_USER= \
    EMAIL_PASSWORD=

# create project directory 
RUN mkdir -p /usr/src/mentor-api
WORKDIR /usr/src/mentor-api

# install dependencies
COPY package*.json ./
RUN npm install

# bundle app source
COPY . .

# migrate the database
#RUN npm run migrate

EXPOSE 4000
CMD ["npm","start"]
