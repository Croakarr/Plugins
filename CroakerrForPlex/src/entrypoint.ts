import { existsSync, readFileSync, writeFileSync } from "fs";

const logo = "https://avatars.githubusercontent.com/u/324832";

import axios from "axios";

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

function handleLibraryContent(hook: WebHook, croakerr: any, logger: any, data: any) {
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
            croakerr.send(hook.url, {
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
            croakerr.send(hook.url, {
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
            croakerr.send(hook.url, {
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
                name: "Library Content Added",
                shortDesc: "Receive updates when content is added to Plex",
                description: "",
                enabled: false,
                hooks: [],
                event: "lidarr.test",
                handler: handleLibraryContent
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