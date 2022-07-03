
const logo = "https://avatars.githubusercontent.com/u/28475832";
const url = "https://discordapp.com/api/webhooks/992454432916766930/db_hAFzowWd2uMxY8sam0HXaeSBkvCgDOCOusOwn5AuJwpN8t5dYkTCMy6lojPAXUEll";

export function enable({ croakerr, logger }) {
    logger.debug("Incoming log message from Lidarr plugin")
    croakerr.registerListener("lidarr.test", (data) => handleTest(croakerr, logger, data));
    croakerr.registerListener("lidarr.download", (data) => handleDownload(croakerr, logger, data));
    croakerr.registerListener("lidarr.grab", (data) => handleGrab(croakerr, logger, data));
}


export function disable() {

}


function handleTest(croakerr: any, logger: any, data: any) {
    logger.log("Received Lidarr test payload");
    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x00a65b,
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
    logger.log("Received Lidarr download payload");
    let text = "";
    let totalBytes = 0;
    for (let i = 0; i < data.tracks.length; i++) {
        let track = data.tracks[i];
        totalBytes += data.trackFiles[i].size
        text += `#${track.trackNumber} - ${track.title} - (${track.quality} - ${bytesToUnit(data.trackFiles[i].size)})\n`
    };

    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x00a65b,
                type: "rich",
                title: "Download completed",
                description: "Artist: `" + data.artist.name + "`\nTrack Count: " + `${data.tracks.length}\nSize on Disk: ${bytesToUnit(totalBytes)}\n\n**Tracklist**:\n${text}`
            }
        ]
    })
}

function handleGrab(croakerr: any, logger: any, data: any) {
    logger.log("Received Lidarr grab payload");
    croakerr.send(url, {
        username: croakerr.manifest.name,
        avatar_url: logo,
        embeds: [
            {
                color: 0x1d563d,
                type: "rich",
                title: "Download Queued",
                description: "Artist: `" + data.artist.name + "`\nAlbum: " + data.albums[0].title + " (" + new Date(data.albums[0].releaseDate).getUTCFullYear() + ")\nDownload Size: " + `${bytesToUnit(data.release.size)}`
            }
        ]
    })
}




function bytesToUnit(bytes) {
    if (bytes === 0) return '0 Bytes';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)) + "");
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}