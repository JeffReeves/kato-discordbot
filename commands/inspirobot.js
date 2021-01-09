const Discord = require('discord.js');
const request = require('request');

module.exports = {
    name: 'inspirobot',
    aliases: ['inspiro', 'quote', 'ib'],
    emojis: ['🤖'],
    cooldown: 1,
	description: 'Gets a random quote from inspirobot.me',
	execute(message, client){

        const inspirobotURL = 'https://inspirobot.me/api?generate=true';
        request(inspirobotURL, function (error, response, body) {
            if(!error && response.statusCode == 200) {
                const inspirobotImageURL = body;

                // confirm acquisition of an Inspirobot URL
                if(!inspirobotImageURL){
                    console.error('[ERROR] Unable to acquire Inspirobot URL: ', body);
                    return;
                }

                // find 'inspirobot' channel
                const inspirobotChannelID = message.guild.channels.cache.find(channel => channel.name === 'inspirobot').id;
                if(!inspirobotChannelID){
                    console.error('[ERROR] Unable to find Inspirobot channel');
                    return;
                }

                const inspirobotChannel = client.channels.cache.get(inspirobotChannelID);

                // get details of the author
                const author        = message.author.username;
                const authorAvatar  = message.author.displayAvatarURL();

                // create an embed to share the content with attribution to the user
                let randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);}); // see: https://stackoverflow.com/a/5092872
                const inspirobotEmbed = new Discord.MessageEmbed()
                    .setColor(randomColor)
                    .setImage(inspirobotImageURL)
                    .setURL(inspirobotImageURL)
                    //.setTitle('Inspirobot.me')
                    //.setAuthor(author, authorAvatar)
                    .setTimestamp()
                    .setFooter(`Requestor: ${author}`, authorAvatar);


                // send embed
                inspirobotChannel.send(inspirobotEmbed);

            }
            else {
                console.error('[ERROR] Error fetching inspirobot image URL: ', response.statusCode);
                return;
            }
        });
	}
};