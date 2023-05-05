import betweenMinutes from "../engine/rules/betweenMinutes";
import configurable from "../engine/rules/configurable";
import EffectConfig from "../effects/EffectConfig";
import everyIntervalSeconds from "../engine/rules/everyIntervalSeconds";
import Fact from "../engine/Fact";
import inGame from "../engine/rules/inGame";
import Rule from "../engine/Rule";
import rules from "../rules";
import topicManager from "../engine/topicManager";
import topics from "../topics";

const POWER_RUNE_SPAWN_INTERVAL = 2 * 60;

export const configTopic = topicManager.createConfigTopic(
    rules.assistant.runePower,
    EffectConfig.PRIVATE
);
export const assistantDescription =
    "Reminds you of power rune spawn every 2:00 after 6:00";

export default [
    new Rule({
        label: rules.assistant.runePower,
        trigger: [topics.time],
        then: () =>
            new Fact(
                topics.configurableEffect,
                "resources/audio/rune-power.wav"
            ),
    }),
]
    .map((rule) => betweenMinutes(6, undefined, rule))
    .map((rule) => configurable(configTopic, rule))
    .map((rule) => everyIntervalSeconds(POWER_RUNE_SPAWN_INTERVAL, rule))
    .map(inGame);
