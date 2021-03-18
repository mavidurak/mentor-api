FROM node:15.10.0-alpine3.10

# environment variables
ENV APP_PORT=4000
ENV DATABASE=mentorApi
ENV DATABASE_USERNAME=root
ENV DATABASE_PASSWORD=123456
ENV DATABASE_HOST=localhost
ENV API_PATH=http://localhost:4000
ENV DASHBOARD_UI_PATH=http://localhost:8080
ENV EMAIL_HOST=smtp.gmail.com
ENV EMAIL_PORT=465
ENV EMAIL_SECURE=true
ENV EMAIL_USER=
ENV EMAIL_PASSWORD=

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
CMD ["npm","start:migrate"]
