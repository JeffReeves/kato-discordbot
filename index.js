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
	console.log('Ready!');
});

// login with OAuth2 token
client.login(config.token);

// listen for messages
client.on('message', message => {

	// log entire message to console
	console.log(message.content);

	// if it contains the the word "ping"
	if (message.content === '!ping') {

		// send back "Pong." to the channel the message was sent in
		message.channel.send('Pong.');
	}
});