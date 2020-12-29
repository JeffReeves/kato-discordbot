/* 
purpose: Discord Bot's main starting file
author: Jeff Reeves
*/

// include config
const config = require('./config.json');
const PREFIX = config.command.prefix;

// include Sequelize and Discord
const Sequelize = require('sequelize');
const Discord = require('discord.js');

// initialize a new client connection
const client = new Discord.Client();

// [alpha]
// [beta]

// trigger when bot is ready
client.once('ready', () => {
	console.debug('[DEBUG] Bot Ready!');
	// [gamma]
});

// on message received
client.on('message', async message => {

	// log entire message to console
	console.log('[MESSAGE]', message.content);

	if (message.content.startsWith(PREFIX)) {
		const input = message.content.slice(PREFIX.length).trim().split(' ');
		const command = input.shift();
		const commandArgs = input.join(' ');

		if (command === 'addtag') {
			// [delta]
		} else if (command === 'tag') {
			// [epsilon]
		} else if (command === 'edittag') {
			// [zeta]
		} else if (command === 'taginfo') {
			// [theta]
		} else if (command === 'showtags') {
			// [lambda]
		} else if (command === 'removetag') {
			// [mu]
		}
	}
});

// login with OAuth2 token
let token = process.env.token || config.token;
client.login(token);
console.debug('[DEBUG] Bot logged in using token');