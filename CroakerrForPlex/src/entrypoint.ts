const logo = "https://avatars.githubusercontent.com/u/324832";
const url = "https://discordapp.com/api/webhooks/992454432916766930/db_hAFzowWd2uMxY8sam0HXaeSBkvCgDOCOusOwn5AuJwpN8t5dYkTCMy6lojPAXUEll";

import axios from "axios";

export function enable({ croakerr, logger }) {
    axios.get("https://example.com");
    logger.debug("Incoming log message from Plex plugin")
    croakerr.registerListener("plex.library.new", (data) => handleLibraryContent(croakerr, logger, data))
}


export function disable() {

}

function handleLibraryContent(croakerr: any, logger: any, data: any) {
    logger.log("Received Plex library payload");

    let fields = [];

    if (data.Metadata.audienceRating) {
        fields.push(
            {
                name: "Audience Rating",
                value: data.Metadata.audienceRating
            }
        )
    }

    switch (data.Metadata.librarySectionType) {
        case "artist":
            croakerr.send(url, {
                username: croakerr.manifest.name,
                avatar_url: logo,
                embeds: [
                    {
                        color: 0xe5a00d,
                        type: "rich",
                        title: "New Music Added",
                        description: `From artist: ${data.Metadata.title}`
                    }
                ]
            })
            break;
        case "show":
            croakerr.send(url, {
                username: croakerr.manifest.name,
                avatar_url: logo,
                embeds: [
                    {
                        color: 0xe5a00d,
                        type: "rich",
                        title: "New Episode Available",
                        description: `Now Airing: ${data.Metadata.title}`,
                        fields
                    }
                ]
            })
            break;
        case "movie":
            croakerr.send(url, {
                username: croakerr.manifest.name,
                avatar_url: logo,
                embeds: [
                    {
                        color: 0xe5a00d,
                        type: "rich",
                        title: "New Movie Available",
                        description: `Now Airing: ${data.Metadata.title}`,
                        fields
                    }
                ]
            })
            break;
        default:
            console.log(data)
    }
}