const logo = "https://avatars.githubusercontent.com/u/25025331";
const url = "https://discordapp.com/api/webhooks/992454432916766930/db_hAFzowWd2uMxY8sam0HXaeSBkvCgDOCOusOwn5AuJwpN8t5dYkTCMy6lojPAXUEll";

export function enable({ croakerr, logger }) {
    logger.debug("Incoming log message from Radarr plugin")
    croakerr.registerListener("radarr.test", (data) => handleTest(croakerr, logger, data));
    croakerr.registerListener("radarr.download", (data) => handleDownload(croakerr, logger, data));
    croakerr.registerListener("radarr.grab", (data) => handleGrab(croakerr, logger, data));
}


export function disable() {

}


function handleTest(croakerr: any, logger: any, data: any) {
    logger.log("Received Radarr test payload");
    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x2193B5,
                type: "rich",
                title: "Webhook Test",
                description: `Since this payload is probably being used for debugging purposes anyway, here's some information about the plugin which made it.`,
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
    logger.log("Received Radarr download payload");


    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x2193B5,
                type: "rich",
                title: "Download completed",
                description: `Title: ${data.movie.title} (${data.movie.year})\nQuality: ${data.release.quality} (${bytesToUnit(data.movieFile.size / 8)})`
            }
        ]
    })
}

function handleGrab(croakerr: any, logger: any, data: any) {
    logger.log("Received Radarr grab payload");
    
    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x1a7590,
                type: "rich",
                title: "Download Queued",
                description: `Title: ${data.movie.title} (${data.movie.year})\nQuality: ${data.release.quality}`
            }
        ]
    })
}




function bytesToUnit(bytes) {
    if (bytes === 0) return '0 Bytes';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)) + "");
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}