import colors from "@colors/colors";
import winston from "winston";

function padTo(msg: string, length: number, truncate: boolean) {
    const stripped = colors.stripColors(msg);
    if (stripped.length < length) {
        const endPadLength = length - stripped.length;
        const endPadString = " ".repeat(endPadLength);
        return `${msg}${endPadString}`;
    } else if (truncate) {
        // Big assumption that this string has a color at the start
        // It takes this one color and sets it for the rest of the string
        return msg.slice(0, 5) + stripped.slice(0, length);
    } else {
        return msg;
    }
}

function printFormat(info: winston.Logform.TransformableInfo, colors: boolean) {
    const levelLength = 5;
    const labelLength = 9;
    const out = `${info.timestamp.gray} ${padTo(info.level, levelLength, true)} ${padTo(info.label, labelLength, false)} ${info.message}${info.splat ? `${info.splat}` : " "}`;
    if (colors) {
        return out;
    } else {
        return out.stripColors;
    }
}

// Available levels
// {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// }

function createMap(label: string, levelString: string | undefined) {
    return {
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.simple(),
            winston.format.json(),
            winston.format.timestamp({
                format: "YYYY-MM-DD HH:mm:ss",
            }),
            winston.format.label({
                label,
                message: false,
            })
        ),
        level:      levelString ? levelString : "info",
        transports: [
            new winston.transports.File({
                filename: "error.log",
                format:   winston.format.printf((info) => printFormat(info, false)),
                level:    "error",
            }),
            new winston.transports.File({
                filename: "combined.log",
                format:   winston.format.printf((info) => printFormat(info, false)),
                level:    "debug",
            }),
            new winston.transports.Console({
                format: winston.format.printf((info) => printFormat(info, true)),
            }),
        ],
    };
}

const discord = winston.createLogger(createMap("[DISCORD]".blue, process.env.DISCORD_LOG_LEVEL));

const broker = winston.createLogger(createMap("[BROKER]".yellow, process.env.BROKER_LOG_LEVEL));

const gsi = winston.createLogger(createMap("[GSI]".magenta, process.env.GSI_LOG_LEVEL));
const gsiEvents = winston.createLogger(createMap("[GSI EVENTS]".magenta, process.env.GSI_LOG_LEVEL));
const gsiGameState = winston.createLogger(createMap("[GSI GAME STATE]".magenta, process.env.GSI_LOG_LEVEL));
const gsiItems = winston.createLogger(createMap("[GSI ITEMS]".magenta, process.env.GSI_LOG_LEVEL));
const gsiTime = winston.createLogger(createMap("[GSI TIME]".magenta, process.env.GSI_LOG_LEVEL));

export default {
    broker,
    discord,
    gsi,
    gsiEvents,
    gsiGameState,
    gsiItems,
    gsiTime,
};
