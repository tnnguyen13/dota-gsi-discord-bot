import axios, { AxiosResponse } from "axios";
import fs = require("fs");
import log from "../log";
import path = require("path");

const TTS_DIRECTORY = "resources/audio/tts-cache";
if (!fs.existsSync(TTS_DIRECTORY)) {
    fs.mkdirSync(TTS_DIRECTORY);
}

function ttsPath(ttsString: string) {
    return path.join(TTS_DIRECTORY, `${ttsString}.mp3`);
}

function create(ttsString: string): Promise<AxiosResponse<any, any>> {
    log.verbose("effect", "Processing TTS string '%s'", ttsString);
    const encodedAudio = encodeURIComponent(ttsString);
    return axios({
        method: "get",
        responseType: "stream",
        url: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedAudio}&tl=en&client=tw-ob`,
    })
        .then((response) =>
            response.data
                .pipe(fs.createWriteStream(ttsPath(ttsString)))
                .on("close", () => {
                    log.verbose(
                        "effect",
                        "Finished writing TTS '%s' to file",
                        ttsString
                    );
                })
        )
        .catch((error) => {
            log.error(
                "effect",
                "Unable to TTS %s with error message %s",
                ttsString,
                error.message
            );
        });
}

export default {
    create,
    path: ttsPath,
};