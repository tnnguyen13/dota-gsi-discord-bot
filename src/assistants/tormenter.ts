import { EffectConfig } from "../effectConfigManager";
import Fact from "../engine/Fact";
import helper from "./assistantHelpers";
import Rule from "../engine/Rule";
import RuleConfigurable from "../engine/RuleConfigurable";
import RuleDecoratorAtMinute from "../engine/RuleDecoratorAtMinute";
import RuleDecoratorInGame from "../engine/RuleDecoratorInGame";
import rules from "../rules";
import topicManager from "../engine/topicManager";
import topics from "../topics";

export const configTopic = topicManager.createConfigTopic(
    rules.assistant.tormenter
);
export const defaultConfig = EffectConfig.PUBLIC;
export const assistantDescription =
    'Reminds you of tormenter. Responds to "torment has fallen" and "torment status"';

const tormenterFallenTimeTopic = topicManager.createTopic<number>(
    "tormenterFallenTimeTopic",
    { persistAcrossRestarts: true }
);

export default [
    new RuleDecoratorAtMinute(
        20,
        new RuleConfigurable(
            configTopic,
            new Rule(
                rules.assistant.tormenter,
                [],
                (get) => new Fact(topics.effect, "tormenter has spawned")
            )
        )
    ),
    new RuleConfigurable(
        configTopic,
        new Rule(
            "tormenter reminder",
            [topics.time, tormenterFallenTimeTopic],
            (get) => {
                const time = get(topics.time);
                const fallenTime = get(tormenterFallenTimeTopic)!;
                if (time === fallenTime + 60 * 10) {
                    return [
                        new Fact(topics.effect, "Tormenter has respawned"),
                        new Fact(tormenterFallenTimeTopic, undefined),
                    ];
                }
            }
        )
    ),
    new RuleConfigurable(
        configTopic,
        new Rule("tormenter voice", [topics.lastDiscordUtterance], (get) => {
            const lastDiscordUtterance = get(topics.lastDiscordUtterance)!;
            if (lastDiscordUtterance.match(/^torment has fallen$/i)) {
                return [
                    new Fact(tormenterFallenTimeTopic, get(topics.time)),
                    new Fact(topics.effect, "OK"),
                ];
            }
            if (lastDiscordUtterance.match(/^torment status$/i)) {
                const fallenTime = get(tormenterFallenTimeTopic);
                let message: string;
                if (fallenTime) {
                    message = `Tormenter is dead. Will respawn at ${helper.secondsToTimeString(
                        fallenTime + 10 * 60
                    )}`;
                } else if (get(topics.time)! >= 20 * 60) {
                    return new Fact(topics.effect, "Tormenter is alive");
                } else {
                    return new Fact(
                        topics.effect,
                        "Tormenter will spawn at 20 minutes"
                    );
                }
                return new Fact(topics.effect, message);
            }
        })
    ),
].map((rule) => new RuleDecoratorInGame(rule));
