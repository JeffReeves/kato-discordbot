# Kato DiscordBot

A Discord Bot to assist with managing servers and their channels.

Post messages at certain times/intervals, copy tagged messages from 
one channel to another, etc.

Named in homage of the assistant, driver, enforcer, and friend of 
"The Green Hornet".

![Kato DiscordBot](assets/kato_discordbot.png)

Kato in Green Hornet: Year One vol. 1, #1 (April 2011). 
Art by Aaron Campbell / Dynamite Entertainment.
<br/>
By Source ([WP:NFCC#4](//en.wikipedia.org/wiki/Wikipedia:Non-free_content_criteria#4) "Wikipedia:Non-free content criteria"), 
[Fair use](https://en.wikipedia.org/w/index.php?curid=54602393 "Fair use of copyrighted material in the context of Kato (The Green Hornet)")


## How to Use

### Create a Discord Bot and Get its OAuth2 Token

In order for this app to run it needs two things:

1. A bot account created in Discord.
2. An OAuth2 token for this script to sign in to the bot account.

Please review this guide for details on how to do both here:<br>
[Discord.js Bot Setup Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

### Setup Environment

This application is written using Node.js (v14 LTS).

Please follow this guide to install Node.js for your operating system:<br>
[Node.js Installation Guide](https://nodejs.org/en/download/package-manager/)

After Node.js is installed, confirm you are using at least 
version 14 using this command:

```sh
node --version
```

Output should look similar to:
```
user@host:~/kato-discordbot$ node --version
v14.15.3
```

### Install Dependencies

This application is built on top of:

- [Discord.js Library](https://discord.js.org/)

- [Sequelize](https://sequelize.org/)

- [fs](https://nodejs.dev/learn/the-nodejs-fs-module)

In order to use these libraries you must either install them from the 
package.json file or manually from npm.

A. Install from package.json:
```sh
cd <project-directory>
npm install
```

B. Install manually from npm:
```sh
npm install --save discord.js sequelize fs
```

### Run Application for Testing/Develpoment

The application needs the OAuth2 token to be specified within 
the `config.json` file or defined on the commandline.

A. Edit the `config.json` file and set the `token` value:

```json
"token": "<OAuth2_token_goes_here>"
```

Then run the app with node:
```sh
node index.js
```

B. Define your bot's token value on the command line and 
run it at the same time:

```sh
token='<OAuth2_token_goes_here>' node index.js
```


### Run Application in Production

I highly recommend running this app using a process manager like PM2.

For instructions on how to install and use PM2, please see this guide:
[PM2](https://pm2.keymetrics.io/)

After PM2 is installed, edit the `config.json` file and set the `token` value:

```json
"token": "<OAuth2_token_goes_here>"
```

Then start the app with PM2:

```sh
cd <directory-above-project>
pm2 start <project-directory>
```

Alternatively, start the app with PM2 inside the project directory:

```sh
cd <project-directory>
pm2 start index.js
```

Monitoring of the app can be done with:

```sh
pm2 monit
```

## LICENSE

Licensed under GNU GPLv3.

See [LICENSE](LICENSE) file for further details.