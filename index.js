/* 
purpose: Discord Bot's main starting file
author: Jeff Reeves
*/

// include config
const config = require('./config.json');
const prefix = config.command.prefix;
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

    // skip if the message's author is a bot
    if(message.author.bot) {
        return;
    }

    // log entire message to console
    console.log('[DEBUG 1] Message Object: ', message);
    console.log('[DEBUG 2] Content: ', message.content);
    console.log('[DEBUG 2] Author:  ', message.author);
    console.log('[DEBUG 2] URL:     ', message.url);
    console.log('[DEBUG 2] Channel: ', message.channel);
    console.log('[DEBUG 2] Guild:   ', message.guild);
    const member = message.guild.member(message.author.id);
    if (member) {
        console.log('[DEBUG 3] Guild Member:   ', member);
        console.log('[DEBUG 4] Member role cache: ', member.roles.cache);
        if (member.roles.cache.some(role => role.name.toLowerCase() === 'admin')) {
            console.log('[DEBUG 5] Member is of role "admin"');
        }
    }

    

    // const member = message.mentions.members.first();
    // console.log('[DEBUG] Member: ', member);

    // if (member.roles.cache.some(role => role.name.toLowerCase() !== 'admin')) {
    //     console.log('[DEBUG]', 'Member is not in role "admin"');
    // }
    
    // else if (member.roles.cache.some(role => role.name === 'admin')) {
    //     console.log('[DEBUG]', 'Member is an "admin"');
    // }

//     if(message.content.startsWith(prefix)) {
//         const input = message.content.slice(prefix.length).trim().split(' ');
//         const command = input.shift();
//         const commandArgs = input.join(' ');

//         // addtag
//         if(command === 'help') {
//             const helpMessage = `The following options are available:
// \`\`\`
// ${prefix}tag        <tagname>
// ${prefix}taginfo    <tagname>
// ${prefix}showtags
// ${prefix}addtag     <tagname> <description>
// ${prefix}edittag    <tagname> <description>
// ${prefix}removetag  <tagname>
// \`\`\``;

//             return message.reply(helpMessage);
//         }

//         // tag
//         else if(command === 'tag') {
//             const tagName = commandArgs;

//             // equivalent to: 
//             //  SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
//             const tag = await Tags.findOne({ where: { name: tagName } });

//             if(tag) {
//                 // equivalent to: 
//                 //  UPDATE tags SET usage_count = usage_count + 1 \ 
//                 //  WHERE name = 'tagName';
//                 tag.increment('usage_count');
                
//                 return message.channel.send(tag.get('description'));
//             }

//             return message.reply(`Could not find tag: ${tagName}`);
//         } 
//         // taginfo
//         else if(command === 'taginfo') {
//             const tagName = commandArgs;

//             // equivalent to: 
//             //  SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
//             const tag = await Tags.findOne({ where: { name: tagName } });

//             if(tag) {
//                 return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
//             }
            
//             return message.reply(`Could not find tag: ${tagName}`);
//         } 
        
//         // showtags
//         else if(command === 'showtags') {
//             // equivalent to: 
//             //  SELECT name FROM tags;
//             const tagList = await Tags.findAll({ attributes: ['name'] });

//             const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';

//             return message.channel.send(`List of tags: ${tagString}`);
//         } 

//         // addtag
//         else if(command === 'addtag') {
//             const splitArgs = commandArgs.split(' ');
//             const tagName = splitArgs.shift();
//             const tagDescription = splitArgs.join(' ');

//             try {
//                 // equivalent to: 
//                 //  INSERT INTO tags (name, description, username) \
//                 //  values (?, ?, ?);
//                 const tag = await Tags.create({
//                     name: tagName,
//                     description: tagDescription,
//                     username: message.author.username,
//                 });

//                 return message.reply(`Tag ${tag.name} added.`);
//             }
//             catch(e) {
//                 if(e.name === 'SequelizeUniqueConstraintError') {
//                     return message.reply('That tag already exists.');
//                 }

//                 return message.reply('Something went wrong with adding a tag.');
//             }
//         } 
        
//         // edittag
//         else if(command === 'edittag') {
//             const splitArgs = commandArgs.split(' ');
//             const tagName = splitArgs.shift();
//             const tagDescription = splitArgs.join(' ');

//             // equivalent to: UPDATE tags (description) values (?) WHERE name='?';
//             const affectedRows = await Tags.update({ description: tagDescription }, 
//                                                    { where: { name: tagName }});
            
//             if(affectedRows > 0) {
//                 return message.reply(`Tag ${tagName} was edited.`);
//             }

//             return message.reply(`Could not find a tag with name ${tagName}.`);
//         } 
        
//         // removetag
//         else if (command === 'removetag') {
//             const tagName = commandArgs;
//             // equivalent to: 
//             //  DELETE from tags WHERE name = ?;
//             const rowCount = await Tags.destroy({ where: { name: tagName } });

//             if(!rowCount) {
//                 return message.reply('That tag did not exist.');
//             }

//             return message.reply('Tag deleted.');
//         }
//     }
});

// login with OAuth2 token
let token = process.env.token || config.token;
client.login(token);
console.debug('[DEBUG] Bot logged in using token');