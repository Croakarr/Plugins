import sdk from 'cue-sdk';


async function animateLEDs(service: string) {
    let leds = getAvailableLeds();

    loop(leds, 500, service);
}

function getAvailableLeds() {
    const leds = []
    const deviceCount = sdk.CorsairGetDeviceCount()
    for (let di = 0; di < deviceCount; ++di) {
        const ledPositions = sdk.CorsairGetLedPositionsByDeviceIndex(di)
        leds.push(ledPositions.map(p => ({ ledId: p.ledId, r: 0, g: 0, b: 0 })))
    }

    return leds
}

function performPulseEffect(allLeds: any[], frames, duration, tpf, r: any, g: number, b: any) {
    const cnt = allLeds.length
    let brightness = (frames / (duration / tpf)) * 4
    if (frames > 50) {
        brightness = ((100 - frames) / (duration / tpf)) * 4
    }
    for (let di = 0; di < cnt; ++di) {
        const device_leds = allLeds[di]
        device_leds.forEach((led: { r: number; g: number; b: number; }) => {
            led.r = parseInt((r * brightness).toFixed(0))
            led.g = parseInt((g * brightness).toFixed(0))
            led.b = parseInt((b * brightness).toFixed(0))
        })

        sdk.CorsairSetLedsColorsBufferByDeviceIndex(di, device_leds)
    }
    sdk.CorsairSetLedsColorsFlushBuffer()
}

const services = {
    croakerr: {
        r: 0x05,
        g: 0x96,
        b: 0x05
    },
    plex: {
        r: 0xe5,
        g: 0xa0,
        b: 0x0d,
    },
    radarr: {
        r: 0xfa,
        g: 0xbf,
        b: 0x30,
    },
    sonarr: {
        r: 0x21,
        g: 0x93,
        b: 0xB5,
    },
    lidarr: {
        r: 0x00,
        g: 0xa6,
        b: 0x5b,
    }
}

function loop(leds: any[], waveDuration: number, service: string) {
    const TIME_PER_FRAME = Math.floor(waveDuration / 100)
    let frames = 0;
    performPulseEffect(leds, frames, waveDuration, TIME_PER_FRAME, services[service].r, services[service].g, services[service].b)
    let interval = setInterval(() => {
        frames += 1;
        performPulseEffect(leds, frames, waveDuration, TIME_PER_FRAME, services[service].r, services[service].g, services[service].b)
    }, TIME_PER_FRAME);

    setTimeout(() => {
        clearInterval(interval)
    }, TIME_PER_FRAME * 100 * 3.1)
}

const details = sdk.CorsairPerformProtocolHandshake();
const errCode = sdk.CorsairGetLastError();
enable();
export function enable({ croakerr, logger } = { croakerr: undefined, logger: undefined }) {
    if (croakerr) {
        if (errCode !== 0) {
            logger.error(`Handshake failed: ${sdk.CorsairErrorToString(errCode)}`)
            return;
            // Disable plugin by returning before registerring a listener.
        }

        animateLEDs("croakerr");
        croakerr.registerListener("radarr.test", () => animateLEDs("radarr"));
        croakerr.registerListener("radarr.grab", () => animateLEDs("radarr"));
        croakerr.registerListener("radarr.download", () => animateLEDs("radarr"));
        croakerr.registerListener("sonarr.test", () => animateLEDs("sonarr"));
        croakerr.registerListener("sonarr.grab", () => animateLEDs("sonarr"));
        croakerr.registerListener("sonarr.download", () => animateLEDs("sonarr"));
        croakerr.registerListener("lidarr.test", () => animateLEDs("lidarr"));
        croakerr.registerListener("lidarr.grab", () => animateLEDs("lidarr"));
        croakerr.registerListener("lidarr.download", () => animateLEDs("lidarr"));
        croakerr.registerListener("plex.library.new", () => animateLEDs("plex"));
    }
}