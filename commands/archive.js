const Discord = require('discord.js');
const config  = require('../config.json');
const prefix  = config.command.prefix;
const archive = config.command.archive;

module.exports = {
    name: 'archive',
    aliases: ['share', 'save'],
    emojis: ['📎', '💾', '📌'],
    cooldown: 10,
	description: 'Clones a message and makes a custom embed in another channel',
	execute(message, client){

        // skip if the channel is NOT in the archive's "from" list
        if(!archive.channels.some(channel => channel['from'] === message.channel.name)){
            console.debug(`[DEBUG] Channel name ${message.channel.name} is NOT included in ${archive.channels}`);
            return;
        }

        // get details of the message and author
        let   content       = message.content.trim();
        const author        = message.author.username;
        const authorAvatar  = message.author.displayAvatarURL();
        const authorURL     = message.url;
        const attachments   = message.attachments;

        // create a list of all commands, including aliases
        let commands = Array.from(this.aliases);
        commands.unshift(this.name);

        // [HOTFIX] custom emotes break embeds
        console.debug('[DEBUG HOTFIX] Message content: ');
        console.debug(content);

        // check for any custom emotes
        // they are in the format '<:custom_name:18-digit-numbers>'
        const regexCustomEmote = new RegExp(/<(:.*?:)[0-9]+>/, 'gi');
        let customEmotes = content.match(regexCustomEmote);
        console.debug('[DEBUG HOTFIX 1] custom emotes found:');
        console.debug(customEmotes);

        // if customEmotes are present, strip out the shortcodes (':name:')
        const regexEmoteShortcode = new RegExp(/<(:.*?:)([0-9]+)>/, 'i');
        if(customEmotes){
            for(let customEmote of customEmotes){
                let customEmoteValues = customEmote.match(regexEmoteShortcode);
                console.debug('[DEBUG HOTFIX 2] custom emote values:');
                console.debug(customEmoteValues);
                let customShortcode   = customEmoteValues[1];
                let customNumber      = customEmoteValues[2];
                console.debug('[DEBUG HOTFIX 2] custom shortcode and number:');
                console.debug(customShortcode);
                console.debug(customNumber);

                // fetch each custom emote
                let customEmoji = client.emojis.cache.get(customNumber);
                console.debug('[DEBUG HOTFIX 2] Custom emoji:');
                console.debug(customEmoji);
                console.debug(customEmoji.toString());

                // replace custom emotes with their shortcodes
                //content = content.replace(customEmote, customShortcode);
                
                // replace custom emotes with the custom emoji
                //content = content.replace(customEmote, customEmoji);
            }

            // console.debug('[DEBUG HOTFIX 3] Message content after replacement: ');
            // console.debug(content);
        }

        // strip out all prefix and command (ex.`!share`) from the message
        for(let command of commands){
            content = content.replace(prefix + command, '');
        }

        // regex for finding URLs
        //let regexURL = new RegExp(/(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?/, 'gi'); // see: @imme_emosol https://mathiasbynens.be/demo/url-regex
        let regexURL = new RegExp(/(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?/, 'gi'); // Diego Perini, MIT, https://gist.github.com/dperini/729294

        // check if any URLs are present in the content, and save them to an array
        let URLs = null;
        if(content.match(regexURL)) {
            URLs = content.match(regexURL);
        }

        // get the "to" channel value
        const archiveName = archive.channels.find(channel => channel['from'] === message.channel.name).to;

        // find 'archive' channel's ID
        const archiveID = message.guild.channels.cache.find(channel => channel.name === archiveName).id;

        // skip if no archiveID was found
        if(!archiveID){
            console.log(`[DEBUG] Unable to find ID for channel ${archiveName}`);
            return;
        }

        // get channel from ID
        const archiveChannel = client.channels.cache.get(archiveID);

        // create embed title from the message content
        let abbreviatedTitle = 'Share'; // default

        // split the content by newlines to derive a title
        const separators = new RegExp('[\n]');
        if(content.split(separators)){
            abbreviatedTitle = content.split(separators)[0];
        }

        // remove any double space left by removing prefix + command
        abbreviatedTitle = abbreviatedTitle.replace('  ', ' ');

        // abbreviate title to less <=60 characters
        const titleLength = 60;
        if(abbreviatedTitle.length >= titleLength){
            abbreviatedTitle = abbreviatedTitle.substring(0,titleLength-3) + '...';
        }

        // create an embed to share the content with attribution to the user
        var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}); // see: https://stackoverflow.com/a/5092872
        const archiveEmbed = new Discord.MessageEmbed()
            .setColor(randomColor)
            .setTitle(abbreviatedTitle)
            //.setAuthor(author, authorAvatar)
            .setDescription(content)
            .setTimestamp()
            .setFooter(`Shared by: ${author}`, authorAvatar);

        // verify there are attachments in the message
        if(attachments){

            // general purpose function for human readible file sizes
            // see: https://stackoverflow.com/a/61505697
            const hFileSize = function(bytes, si=false){
                let u, b=bytes, t= si ? 1000 : 1024;     
                ['', si?'k':'K', ...'MGTPEZY'].find(x=> (u=x, b/=t, b**2<1));
                return `${u ? (t*b).toFixed(1) : bytes} ${u}${!si && u ? 'i':''}B`;    
            };

            // iterate over each attachment
            attachments.forEach((attachment) => {

                // set the thumbnail of the embed to the URL of any image
                if(attachment.url.match(/.(jpg|jpeg|png|gif|bmp|ico)$/i)){
                    //archiveEmbed.setThumbnail(attachment.url);
                    archiveEmbed.setImage(attachment.url);
                }
                else {

                    // get filesize in human readible format
                    const fileSize = hFileSize(attachment.size);

                    // add a link to each file
                    archiveEmbed.addFields({
                        name: 'Attachment', 
                        value: `[${attachment.name}](${attachment.url}) \`${fileSize}\``
                    });
                }
            });
        }

        // set URL if one was found
        if(URLs){
            archiveEmbed.setURL(URLs[0]);
        }

        // add link back to original post
        archiveEmbed.addFields({ 
            name: '\u200B', 
            value: `[Original Post](${authorURL})` 
        });

        // send embed of the share
        archiveChannel.send(archiveEmbed);

        // create additional embeds for any/all URLs in message content
        if(URLs){
            // get total number of URLs
            const numURLs = URLs.length;
            // send each URL as a separate post
            URLs.forEach((URL, index) => {
                archiveChannel.send(`\`[URL ${index + 1}/${numURLs}]\` ${URL}`);
            });
            // to send all URLs in a single post
            //archiveChannel.send(URLs.join('\n'));
        }
    }
};