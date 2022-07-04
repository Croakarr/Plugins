import { existsSync, readFileSync, writeFileSync } from "fs";

const logo = "https://avatars.githubusercontent.com/u/28475832";

export async function enable({ croakarr, logger }): Promise<[boolean, Error | null]> {
    try {
        let config: null | Config = null;
        logger.log(__dirname + "/settings.json")
        if (!existsSync(__dirname + "/settings.json")) {
            config = await setup(croakarr, logger);
            logger.debug("Plugin configuration not found.")
            logger.debug("Commencing guided setup.")
            writeFileSync(__dirname + "/settings.json", JSON.stringify(config));
        } else {
            let text = readFileSync(__dirname + "/settings.json", 'utf-8');
            try {
                config = JSON.parse(text);
            } catch (e) {
                logger.error("FATAL ERROR - Unable to read configuration.");
                return [false, e];
            }
        }


        if (config !== null) {
            console.log(config.events);
            for (let i = 0; i < config.events.length; i++) {
                let evt = config.events[i];
                if (evt.hooks.length > 0) {
                    croakarr.registerListener(evt.event, (data) => {
                        for (let h = 0; h < evt.hooks.length; h++) {
                            evt.handler(evt.hooks[h], croakarr, logger, data);
                        }
                    })
                }
            }
            return [true, null];
        }
    } catch (e) {
        return [false, e];
    }
}

export function disable() {

}


function handleTest(hook: WebHook, croakarr: any, logger: any, data: any) {
    croakarr.send(hook.url, {
        username: croakarr.manifest.name,
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
                        value: croakarr.manifest.name,
                        inline: true
                    },
                    {
                        name: "Version",
                        value: croakarr.manifest.version,
                        inline: true
                    },
                    {
                        name: "Author",
                        value: croakarr.manifest.author,
                        inline: true
                    }
                ]
            }
        ]
    });
}

function handleDownload(hook: WebHook, croakarr: any, logger: any, data: any) {
    let text = "";
    let totalBytes = 0;
    for (let i = 0; i < data.tracks.length; i++) {
        let track = data.tracks[i];
        totalBytes += data.trackFiles[i].size
        text += `#${track.trackNumber} - ${track.title} - (${track.quality} - ${bytesToUnit(data.trackFiles[i].size)})\n`
    };

    croakarr.send(hook.url, {
        username: croakarr.manifest.name,
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

function handleGrab(hook: WebHook, croakarr: any, logger: any, data: any) {
    croakarr.send(hook.url, {
        username: croakarr.manifest.name,
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

function bytesToUnit(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)) + "");
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + ['Bytes', 'KB', 'MB', 'GB', 'TB'][i];
}

interface Config {
    webhooks: WebHook[];
    events: EventInfo[]
}

interface PartialHook {
    name: string;
    url: string;
}

interface WebHook {
    name: string;
    url: string;
    service: HookService | undefined;
}

enum HookService {
    UNKNOWN = "UNKNOWN",
    DISCORD = "Discord"
}

interface EventInfo {
    name: string;
    description: string;
    enabled: boolean;
    hooks: number[];
    event: string;
    handler: Function;
}

const HTTP: RegExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
const acceptedDomains = {};
acceptedDomains[HookService.DISCORD] = ["discordapp.com"];


async function setup(croakarr: any, logger: any): Promise<Config> {
    let core = {
        webhooks: await setupWebhooks(croakarr, logger),
        events: [
            {
                name: "Test",
                shortDesc: "Receive test events from Lidarr",
                description: "A test event used to ensure that the hooks work correctly.",
                enabled: false,
                hooks: [],
                event: "lidarr.test",
                handler: handleTest
            },
            {
                name: "Download",
                shortDesc: "Receive import details from Lidarr",
                description: "An event emitted when Lidarr imports a completed media asset into the user's library.",
                enabled: false,
                hooks: [],
                event: "lidarr.download",
                handler: handleDownload
            },
            {
                name: "Grab",
                shortDesc: "Receive download details from Lidarr",
                description: "An event emitted when Lidarr grabs an applicable download asset for the user's library.",
                enabled: false,
                hooks: [],
                event: "lidarr.grab",
                handler: handleGrab
            }
        ]
    }

    let choices = [];
    let longest = 0;
    for (let i = 0; i < core.events.length; i++) {
        if (longest < core.events[i].name.length) longest = core.events[i].name.length;
        choices.push({ title: core.events[i].name, value: core.events[i].event })
    }

    for (let i = 0; i < choices.length; i++) {
        let name = core.events[i].name;
        while (name.length < longest + 1) {
            name += " "
        }
        choices[i].title = name + " - " + core.events[i].shortDesc
    }

    for (let i = 0; i < core.webhooks.length; i++) {
        let { subscribe }: any = await croakarr.prompt({
            type: "multiselect",
            name: "subscribe",
            message: "Select which events you want to receive for hook: '" + core.webhooks[i].name + "' (" + core.webhooks[i].service + ")",
            choices,
            hint: '- Space to select. Enter to submit'
        });

        for (let e = 0; e < core.events.length; e++) {
            if (subscribe.includes(core.events[e].event)) {
                let x = core.events[e];
                x.hooks.push(core.webhooks[i]);
                core.events[e] = x;
            }
        }
    }

    console.log(core.events);

    return core;
}

async function setupWebhooks(croakarr: any, logger: any): Promise<WebHook[]> {
    let hooks: WebHook[] = [];

    let another = true;

    while (another) {
        let hook = await singleHook(croakarr, logger);
        if (hook === undefined) another = false;
        if (another) {
            let { confirm }: any = await croakarr.prompt({
                name: "confirm",
                message: "Would you like to set up another webhook?",
                type: "toggle",
                initial: false,
                active: "Yes",
                inactive: "No"
            });
            another = confirm;
        }


        hooks.push(hook);
    }

    return hooks;
}

async function singleHook(croakarr: any, logger: any): Promise<WebHook | undefined> {
    try {
        let service: any = {
            service: "discord" //await croakarr.prompt({
            //     name: "service",
            //     type: "select",
            //     message: "Which service would you like to interact with?",
            //     choices: [
            //         { title: "Discord" }
            //     ]
            // });
        }

        let serviceDefault = "";

        switch (service.service.toLowerCase()) {
            case "discord":
                serviceDefault = "https://discordapp.com/"
                service.formatted = HookService.DISCORD
                break;
            default:
                serviceDefault = "UNKNOWN SERVICE";
                service.formatted = HookService.UNKNOWN
        }

        let hook: PartialHook = {
            url: (await croakarr.prompt({
                name: "url",
                type: "text",
                message: "Enter your webhook URL",
                default: serviceDefault,
                validate: (v: string) => {
                    let valid = HTTP.test(v);

                    if (valid) {
                        let uri = new URL(v);
                        switch (service.formatted) {
                            case HookService.DISCORD:
                                valid = acceptedDomains[HookService.DISCORD].includes(uri.hostname);
                                break;
                            default:
                                valid = false;
                        }
                        if (!valid) {
                            if (service.formatted !== HookService.UNKNOWN) return `Invalid host: Accepted hosts for '${service.formatted}' are: \n - ${acceptedDomains[service.formatted].join("\n - ")}`
                        }
                    }

                    return valid;
                }
            })).url,
            name: (await croakarr.prompt({
                name: "name",
                type: "text",
                message: "What should we call this hook?",
                default: service.service
            })).name
        }

        return {
            name: hook.name,
            url: hook.url,
            service: service.formatted
        };
    } catch (e) {
        return undefined;
    }
}