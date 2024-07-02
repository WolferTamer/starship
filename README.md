# Starship

Requirements:

NodeJs version `20.14.2` or greater

Global Typescript Install `npm install typescript -g`

This programs requires a `.env` file in order to run. The values you need are TOKEN (the bot's unique token), CLIENT (the bot's ID), GUILD (the local guild to register commands to), and MONGODB_SRV (the path to the mongodb server)

`npm run dev` to run in dev mode.

`npm run build` to convert to js

`npm run start` to run js

Compiling the code to run independant of JS is more complicated. After conversion, copy and paste both package.json and package-lock.json into dist. If you wish to use pm2, create an ecosystem.config.js file inside dist. Use that file for enviroment variables.