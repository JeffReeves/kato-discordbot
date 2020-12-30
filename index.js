/* 
purpose: Discord Bot's main starting file
author: Jeff Reeves
*/

// include config
const config = require('./config.json');
const PREFIX = config.command.prefix;
const DB     = config.db.name;

// include Sequelize and Discord
const Sequelize = require('sequelize');
const Discord = require('discord.js');

// initialize a new client connection
const client = new Discord.Client();

// setup sequelize database using sqlite
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: `${DB}.sqlite`,
});

// Sequelize table models
/*
 * equivalent to SQL: 
 * CREATE TABLE tags(
 *     name VARCHAR(255),
 *     description TEXT,
 *     username VARCHAR(255),
 *     usage INT
 * );
 */
const Tags = sequelize.define('tags', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    description: Sequelize.TEXT,
    username: Sequelize.STRING,
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

// trigger when bot is ready
client.once('ready', () => {
    console.debug('[DEBUG] Bot Ready!');

    // Sequelize sync Tags table
    Tags.sync({ force: true }) // force clears table
});

// on message received
client.on('message', async message => {

    // log entire message to console
    console.log('[MESSAGE]', message.content);

    if(message.content.startsWith(PREFIX)) {
        const input = message.content.slice(PREFIX.length).trim().split(' ');
        const command = input.shift();
        const commandArgs = input.join(' ');

        // addtag
        if(command === 'help') {
            const helpMessage = 'The following options are available:\n'+
                                '```\n'                                 +
                                '!tag        <tagname>\n'               +
                                '!taginfo    <tagname>\n'               +
                                '!showtags\n'                           +
                                '!addtag     <tagname> <description>\n' +
                                '!edittag    <tagname> <description>\n' +
                                '!removetag  <tagname>\n'               +
                                '```';

            return message.reply(`[HELP]: ${helpMessage}`);
        }

        // tag
        else if(command === 'tag') {
            const tagName = commandArgs;

            // equivalent to: 
            //  SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { name: tagName } });

            if(tag) {
                // equivalent to: 
                //  UPDATE tags SET usage_count = usage_count + 1 \ 
                //  WHERE name = 'tagName';
                tag.increment('usage_count');
                
                return message.channel.send(tag.get('description'));
            }

            return message.reply(`Could not find tag: ${tagName}`);
        } 
        // taginfo
        else if(command === 'taginfo') {
            const tagName = commandArgs;

            // equivalent to: 
            //  SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
            const tag = await Tags.findOne({ where: { name: tagName } });

            if(tag) {
                return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
            }
            
            return message.reply(`Could not find tag: ${tagName}`);
        } 
        
        // showtags
        else if(command === 'showtags') {
            // equivalent to: 
            //  SELECT name FROM tags;
            const tagList = await Tags.findAll({ attributes: ['name'] });

            const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';

            return message.channel.send(`List of tags: ${tagString}`);
        } 

        // addtag
        else if(command === 'addtag') {
            const splitArgs = commandArgs.split(' ');
            const tagName = splitArgs.shift();
            const tagDescription = splitArgs.join(' ');

            try {
                // equivalent to: 
                //  INSERT INTO tags (name, description, username) \
                //  values (?, ?, ?);
                const tag = await Tags.create({
                    name: tagName,
                    description: tagDescription,
                    username: message.author.username,
                });

                return message.reply(`Tag ${tag.name} added.`);
            }
            catch(e) {
                if(e.name === 'SequelizeUniqueConstraintError') {
                    return message.reply('That tag already exists.');
                }

                return message.reply('Something went wrong with adding a tag.');
            }
        } 
        
        // edittag
        else if(command === 'edittag') {
            const splitArgs = commandArgs.split(' ');
            const tagName = splitArgs.shift();
            const tagDescription = splitArgs.join(' ');

            // equivalent to: UPDATE tags (description) values (?) WHERE name='?';
            const affectedRows = await Tags.update({ description: tagDescription }, 
                                                   { where: { name: tagName }});
            
            if(affectedRows > 0) {
                return message.reply(`Tag ${tagName} was edited.`);
            }

            return message.reply(`Could not find a tag with name ${tagName}.`);
        } 
        
        // removetag
        else if (command === 'removetag') {
            const tagName = commandArgs;
            // equivalent to: 
            //  DELETE from tags WHERE name = ?;
            const rowCount = await Tags.destroy({ where: { name: tagName } });

            if(!rowCount) {
                return message.reply('That tag did not exist.');
            }

            return message.reply('Tag deleted.');
        }
    }
});

// login with OAuth2 token
let token = process.env.token || config.token;
client.login(token);
console.debug('[DEBUG] Bot logged in using token');