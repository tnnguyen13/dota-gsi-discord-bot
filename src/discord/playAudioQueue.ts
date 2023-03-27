import colors from "@colors/colors";
import engine from "../customEngine";
import Fact from "../engine/Fact";
import log from "../log";
import Rule from "../engine/Rule";
import topic from "../topic";
import Voice = require("@discordjs/voice");

const emColor = colors.cyan;

engine.register(
    new Rule(
        "discord/play_next",
        [
            topic.discordReadyToPlayAudio,
            topic.audioQueue,
            topic.discordSubscriptionTopic,
        ],
        (get) => {
            const ready = get(topic.discordReadyToPlayAudio)!;
            const subscription = get(topic.discordSubscriptionTopic)!;
            const audioQueue = [...get(topic.audioQueue)!];

            if (ready && audioQueue.length > 0) {
                const filePath = audioQueue.pop()!;
                log.info("discord", "Playing %s", emColor(filePath));
                const resource = Voice.createAudioResource(filePath);
                subscription.player.play(resource);
                return [
                    new Fact(topic.audioQueue, audioQueue),
                    new Fact(topic.discordReadyToPlayAudio, false),
                ];
            }
        }
    )
);
