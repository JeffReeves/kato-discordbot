/* 
purpose: Discord Bot's main starting file
author: Jeff Reeves
*/

// include config
const config        = require('./config.json');
const prefix        = config.command.prefix;
const emojis        = config.command.emojis;

// include file system, Sequelize, and Discord
const fs        = require('fs');
const Discord   = require('discord.js');

// initialize a new client connection and command collection
const client    = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// add cooldowns to prevent spamming
const cooldowns = new Discord.Collection();

// trigger when bot is ready
client.once('ready', () => {
    console.debug('[DEBUG] Bot Ready!');
});


// on reactions with emojis
client.on('messageReactionAdd', async messageReaction => {

    // skip if the author is a bot
    if(messageReaction.message.author.bot) {
        return;
    }

    // skip if reaction emoji is not on emoji list
    if(!emojis.includes(messageReaction._emoji.name)){
        console.log(`[DEBUG] Reaction emoji ${messageReaction._emoji.name} is NOT in emoji list ${emojis}`);
        return;
    }

    // check if the current emoji is in the cache with a count > 1,
        // if it is, skip it
    if(messageReaction.message.reactions.cache.get(messageReaction._emoji.name).count > 1){
        console.log(`[DEBUG] ${messageReaction._emoji.name} count is greater than 1`);
        return;
    }

    // assume that current emoji was just added with a count of 1
    // get emoji list (sans current emoji), and check the cache to see if any 
    //  of them are in the cache
        // if so, skip here
    const remainingEmoji = emojis.filter((emoji) => { 
        return emoji !== messageReaction._emoji.name
    });

    if(messageReaction.message.reactions.cache.some((reactionValues, reactionEmoji) => {
        //console.log('[DEBUG] Checking reactions cache for ', reactionEmoji);
        return remainingEmoji.includes(reactionEmoji);
    })){
        //console.log('[DEBUG] Other emojis are already present');
        return;
    }

    // get command based on emoji
    const command = client.commands.find(cmd => cmd.emojis && cmd.emojis.includes(messageReaction._emoji.name));

    // try executing the command or catch its error
	try{
        command.execute(messageReaction.message, client);
    } 
    catch(error){
        console.log('[ERROR] Unable to execute command: ', command);
		console.error(error);
	}
});


// on message received
client.on('message', async message => {

    // skip if the author is a bot
    if(message.author.bot) {
        return;
    }

    // get guild member details from the author's ID
    const member = message.guild.member(message.author.id);

    // skip if not a member
    if(!member) {
        console.log('[WARN] Unable to find member in guild: ', message.author);
        return;
    }

    // regular expression to match a single command pattern
    const commandRegex = new RegExp(prefix + '[\\w-]+', 'i');

    // skip if no command is present in the message
    if(!commandRegex.test(message.content)){
        return;
    }

    // extract command name from message content
    const commandName = message.content.match(commandRegex)[0].toLowerCase().replace(prefix, '');

    // find command from commands collection or from aliases
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
    // remove command from message content and trim whitespace
    message.content = message.content.replace(commandRegex, '').trim();

    // skip if command is not found
	if(!command){
        console.debug('[DEBUG] Command not present: ', commandName);
        return;
    } 

    // check for any cooldowns for the command
	if(!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

    // create new time durations for the cooldown (default to 3 seconds)
	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

    // check if author is in the list of cooldowns
	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`\`[COOLDOWN]\` Please wait ${timeLeft.toFixed(1)} second(s) before trying \`${prefix}${command.name}\` again.`);
		}
	}

    // set latest timestamp for the author
    timestamps.set(message.author.id, now);

    // remove the timestamp after the cooldown time has passed
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    // try executing the command or catch its error
	try{
        command.execute(message, client);
    } 
    catch(error){
        console.log('[ERROR] Unable to execute command: ', command);
		console.error(error);
	}
});

// login with OAuth2 token
const token = process.env.token || config.token;
client.login(token);
console.debug('[DEBUG] Bot logged in using token');