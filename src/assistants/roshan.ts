import Event, { EventType } from "../gsi-data-classes/Event";
import { DeepReadonly } from "ts-essentials";
import { EffectConfig } from "../effectConfigManager";
import Fact from "../engine/Fact";
import helper from "./assistantHelpers";
import Rule from "../engine/Rule";
import RuleDecoratorConfigurable from "../engine/RuleDecoratorConfigurable";
import RuleDecoratorInGame from "../engine/RuleDecoratorInGame";
import rules from "../rules";
import topicManager from "../engine/topicManager";
import topics from "../topics";

export const configTopic = topicManager.createConfigTopic("Roshan");
export const defaultConfig = EffectConfig.PUBLIC;
export const assistantDescription =
    'Tracks roshan respawn time. Responds to discord voice command "What is rosh/roshan status/timer"';

const AEGIS_DURATION = 5 * 60;
const ROSHAN_MINIMUM_SPAWN_TIME = 8 * 60;
const ROSHAN_MAXIMUM_SPAWN_TIME = 11 * 60;

const roshanDeathTimes = topicManager.createTopic<number[]>(
    "roshanDeathTimes",
    {
        persistAcrossRestarts: true,
    }
);

function aliveMessage(killedTimes: number[], dayTime: boolean) {
    const times = killedTimes.length;
    if (times === 0) {
        return "Roshan is alive. Will drop aegis";
    }
    if (times === 1) {
        return "Roshan is alive. Will drop aegis and cheese";
    }
    if (dayTime) {
        return "Roshan is alive. Will drop aegis, cheese, and aghanim's blessing";
    } else {
        return "Roshan is alive. Will drop aegis, cheese, and refresher shard";
    }
}

function roshanWasKilled(events: DeepReadonly<Event[]>) {
    return events.reduce(
        (memo, event) => event.type === EventType.RoshanKilled || memo,
        false
    );
}

function roshStatusMessage(message: string) {
    return message.match(/^(what).{1,15}(status|timer?)$/i) !== null;
}

const roshRulesArray = [
    // When an event notifies us that roshan is killed
    // Set roshan maybe time to 8 minutes from now
    // Set roshan alibe time to 11 minutes from now
    new Rule(
        rules.assistant.roshan.killedEvent,
        [topics.time, topics.events],
        (get) => {
            if (roshanWasKilled(get(topics.events)!)) {
                return new Fact(roshanDeathTimes, [
                    ...(get(roshanDeathTimes) || []),
                    get(topics.time)!,
                ]);
            }
        }
    ),

    // When time is when roshan might be alive
    // Play audio and reset roshan maybe alive time state
    new RuleDecoratorConfigurable(
        configTopic,
        new Rule(
            rules.assistant.roshan.maybeAliveTime,
            [topics.time, roshanDeathTimes],
            (get) => {
                if (
                    get(topics.time)! ===
                    get(roshanDeathTimes)!.at(-1)! + ROSHAN_MINIMUM_SPAWN_TIME
                ) {
                    return new Fact(
                        topics.configurableEffect,
                        "resources/audio/rosh-maybe.mp3"
                    );
                }
            }
        )
    ),

    // When time is when roshan should be alive
    // Play audio and reset roshan alive time state
    new RuleDecoratorConfigurable(
        configTopic,
        new Rule(
            rules.assistant.roshan.aliveTime,
            [topics.time, roshanDeathTimes],
            (get) => {
                if (
                    get(topics.time)! ===
                    get(roshanDeathTimes)!.at(-1)! + ROSHAN_MAXIMUM_SPAWN_TIME
                ) {
                    return [
                        new Fact(
                            topics.configurableEffect,
                            "resources/audio/rosh-alive.mp3"
                        ),
                        new Fact(roshanDeathTimes, undefined),
                    ];
                }
            }
        )
    ),
    new RuleDecoratorConfigurable(
        configTopic,
        new Rule(
            rules.assistant.roshan.voice,
            [topics.lastDiscordUtterance],
            (get) => {
                if (!roshStatusMessage(get(topics.lastDiscordUtterance)!)) {
                    return;
                }
                const killedTimes = get(roshanDeathTimes) || [];
                const killedTime = killedTimes?.at(-1);
                const time = get(topics.time)!;
                let response = aliveMessage(killedTimes, get(topics.dayTime)!);

                if (killedTime) {
                    if (time < killedTime + AEGIS_DURATION) {
                        response = `Roshan is dead. Aegis expires at ${helper.secondsToTimeString(
                            killedTime + AEGIS_DURATION
                        )}`;
                    } else if (time < killedTime + ROSHAN_MINIMUM_SPAWN_TIME) {
                        response = `Roshan is dead. May respawn at ${helper.secondsToTimeString(
                            killedTime + ROSHAN_MINIMUM_SPAWN_TIME
                        )}`;
                    } else if (time < killedTime + ROSHAN_MAXIMUM_SPAWN_TIME) {
                        response = `Roshan may be alive. Guaranteed respawn at ${helper.secondsToTimeString(
                            killedTime + ROSHAN_MAXIMUM_SPAWN_TIME
                        )}`;
                    }
                }
                return new Fact(topics.configurableEffect, response);
            }
        )
    ),
].map((rule) => new RuleDecoratorInGame(rule));

export default roshRulesArray;
