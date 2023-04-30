import atMinute from "../engine/rules/atMinute";
import configurable from "../engine/rules/configurable";
import { EffectConfig } from "../effectConfigManager";
import Fact from "../engine/Fact";
import Rule from "../engine/Rule";
import rules from "../rules";
import topicManager from "../engine/topicManager";
import topics from "../topics";

export const configTopic = topicManager.createConfigTopic(
    rules.assistant.shard
);
export const defaultConfig = EffectConfig.PUBLIC;
export const assistantDescription =
    "Reminds you of shard availability at 15:00";

export default atMinute(
    15,
    configurable(
        configTopic,
        new Rule({
            label: rules.assistant.shard,
            then: () =>
                new Fact(
                    topics.configurableEffect,
                    "resources/audio/shard-available.mp3"
                ),
        })
    )
);
