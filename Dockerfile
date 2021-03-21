FROM node:15.10.0-alpine3.10

ARG node_env=production
ARG app_port=4000

# environment variables
ENV NODE_ENV=$node_env
ENV APP_PORT=$app_port
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
WORKDIR /usr/src/mentor-api

# bundle app source
COPY . .

# install dependencies
RUN npm install --production=false

EXPOSE $app_port
CMD ["npm", "run", "start:migrate"]
