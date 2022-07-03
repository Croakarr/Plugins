const logo = "https://avatars.githubusercontent.com/u/1082903";
const url = "https://discordapp.com/api/webhooks/992454432916766930/db_hAFzowWd2uMxY8sam0HXaeSBkvCgDOCOusOwn5AuJwpN8t5dYkTCMy6lojPAXUEll";

export function enable({ croakerr, logger }) {
    logger.debug("Incoming log message from Sonarr plugin")
    croakerr.registerListener("sonarr.test", (data) => handleTest(croakerr, logger, data));
    croakerr.registerListener("sonarr.download", (data) => handleDownload(croakerr, logger, data));
    croakerr.registerListener("sonarr.grab", (data) => handleGrab(croakerr, logger, data));
}


export function disable() {

}


function handleTest(croakerr: any, logger: any, data: any) {
    logger.log("Received Sonarr test data");
    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x2193B5,
                type: "rich",
                title: "Webhook Test",
                description: `Since this data is probably being used for debugging purposes anyway, here's some information about the plugin which made it.`,
                fields: [
                    {
                        name: "Name",
                        value: croakerr.manifest.name,
                        inline: true
                    },
                    {
                        name: "Version",
                        value: croakerr.manifest.version,
                        inline: true
                    },
                    {
                        name: "Author",
                        value: croakerr.manifest.author,
                        inline: true
                    }
                ]
            }
        ]
    });
}

function handleDownload(croakerr: any, logger: any, data: any) {
    logger.log("Received Sonarr download data");

    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x2193B5,
                type: "rich",
                title: "Download completed",
                description: `Show: ${data.series.title}\nEpisode: S${data.episodes[0].seasonNumber} - E${data.episodes[0].episodeNumber} - ${data.episodes[0].title} (Aired: ${new Date(data.episodes[0].airDate).toLocaleDateString()})`
            }
        ]
    })
}

function handleGrab(croakerr: any, logger: any, data: any) {
    logger.log("Received Sonarr grab data");
    
    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x1a7590,
                type: "rich",
                title: "Download Queued",
                description: `Title: ${data.series.title}\nQuality: ${data.release.quality} (${bytesToUnit(data.release.size / 8)})`
            }
        ]
    })
}




function bytesToUnit(bytes) {
    if (bytes === 0) return '0 Bytes';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)) + "");
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}