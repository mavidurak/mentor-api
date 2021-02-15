# Mentor API

## Install
```
git clone https://github.com/mavidurak/mentor-api.git
cd mentor-api
```
## Setup
```
npm install
```
## Start
```
npm run start
```
## Migration
```
npm run migrate
```
## ESlint Fix
```
npm run lint -- --fix
```
## Example `.env`

```
APP_PORT=4000
DATABASE=mavidurak
DATABASE_USERNAME=root
DATABASE_PASSWORD=
DATABASE_HOST=localhost
API_PATH=http://localhost:4000
DASHBOARD_UI_PATH=http://localhost:8080
EMAIL_HOST=
EMAIL_PORT=
EMAIL_SECURE=
EMAIL_USER=
EMAIL_PASSWORD=
```

[Send mail with smtp.gmail](https://support.google.com/mail/answer/7126229?visit_id=637363760481005370-2213185597&hl=tr&rd=1).If you use smtp.google, ```EMAIL_SECURE=```is mast be ```true```
## License
[GNU General Public License v3.0](LICENSE)
