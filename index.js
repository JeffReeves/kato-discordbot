/* 
purpose: Discord Bot's main starting file
author: Jeff Reeves
*/

// include config
const config = require('./config.json');

// include Discord library
const Discord = require('discord.js');

// initialize a new client connection
const client = new Discord.Client();

// once connection is ready
client.once('ready', () => {
	console.debug('[DEBUG] Bot Ready!');
});

// login with OAuth2 token
let token = process.env.token || config.token;
client.login(token);
console.debug('[DEBUG] Bot logged in using token');

// listen for messages
client.on('message', message => {

	// log entire message to console
	console.log('[MESSAGE]', message.content);

	// if it contains the the word "ping"
	if (message.content === '!ping') {

		// send back "Pong." to the channel the message was sent in
		message.channel.send('Pong.');
	}
});