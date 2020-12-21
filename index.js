/* 
purpose: Discord Bot's main starting file
author: Jeff Reeves
*/

// OAuth2 Token for the bot
// TODO:
//  - reset token after testing
const token = 'NzkwMzU1OTk0MzY5OTgyNTA0.X9_aYQ.09-zVLJ9s4NxQwR9eUfy3n7_r4I';

// include Discord library
const Discord = require('discord.js');

// initialize a new client connection
const client = new Discord.Client();

// once connection is ready
client.once('ready', () => {
	console.log('Ready!');
});

// login with OAuth2 token
client.login(token);

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