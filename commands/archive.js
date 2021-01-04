module.exports = {
	name: 'archive',
	description: 'Clones a message and makes a custom embed in another channel',
	execute(message){

        console.debug('[DEBUG 2] Trying to archive...');

        // if the channel contains 'share' in the name
        const shareSuffix   = '-share';
        const archiveSuffix = '-archive';
        if(message.channel.name.indexOf(shareSuffix) !== -1){

            // skip if the message does not contain '!share' in the message
            if(message.content.indexOf(prefix + 'share') === -1){
                return;
            }

            // strip out `!share` from the message
            message.content = message.content.replace(prefix + 'share', '');

            // get share and archive channel names
            const shareChannel   = message.channel.name;
            const archiveChannel = shareChannel.replace(shareSuffix, archiveSuffix);

            // get details of the message and author
            const content       = message.content.trim();
            const author        = message.author.username;
            const authorAvatar  = message.author.displayAvatarURL();
            const authorURL     = message.url;
            const attachments   = message.attachments;

            // regex for finding URLs
            var regexURL = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/, 'gi'); // see: http://urlregex.com/

            // check if any URLs are present in the content, and save them to an array
            let URLs = null;
            if(content.match(regexURL)) {
                URLs = content.match(regexURL);
            }

            // find 'archive' channel based on share channel name
            const archiveID = message.guild.channels.cache.find(channel => channel.name === archiveChannel).id;

            if(archiveID) {
                const archive = client.channels.cache.get(archiveID);

                // create embed title from the message content
                let abbreviatedTitle = 'Share'; // default

                // split the content by newlines to derive a title
                const separators = new RegExp('[\n]');
                if(content.split(separators)){
                    abbreviatedTitle = content.split(separators)[0];
                }

                // remove any double space left by removing !share
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
                archive.send(archiveEmbed);

                // create additional embeds for any/all URLs in message content
                if(URLs){
                    // get total number of URLs
                    const numURLs = URLs.length;
                    // send each URL as a separate post
                    URLs.forEach((URL, index) => {
                        archive.send(`\`[URL ${index + 1}/${numURLs}]\` ${URL}`);
                    });
                    // to send all URLs in a single post
                    //archive.send(URLs.join('\n'));
                }
            }
        }
	}
};