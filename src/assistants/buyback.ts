import Config from "../configTopics";
import Fact from "../engine/Fact";
import PersistentTopic from "../engine/PersistentTopic";
import Rule from "../engine/Rule";
import RuleConfigurable from "../engine/RuleConfigurable";
import rules from "../rules";
import Topic from "../engine/Topic";
import topics from "../topics";

export const configTopic = new PersistentTopic<Config>("buyback", {
    persistForever: true,
});
export const defaultConfig = Config.PRIVATE;

const hasBuybackTopic = new Topic<boolean>("hasBuybackTopic");
topics.registerTopic(hasBuybackTopic);

export default [
    new Rule(
        rules.assistant.buyback.availability,
        [
            topics.inGame,
            topics.time,
            topics.gold,
            topics.buybackCost,
            topics.buybackCooldown,
        ],
        (get) => {
            const inGame = get(topics.inGame)!;
            const time = get(topics.time)!;
            if (!inGame || time < 30 * 60) return;

            const buybackCooldownAvailable = get(topics.buybackCooldown)! === 0;
            const gold = get(topics.gold)!;
            const buybackCost = get(topics.buybackCost)!;
            if (buybackCooldownAvailable) {
                const hasBuyback = gold >= buybackCost;
                return new Fact(hasBuybackTopic, hasBuyback);
            } else {
                return new Fact(hasBuybackTopic, false);
            }
        }
    ),
    new RuleConfigurable(
        rules.assistant.buyback.warnNoBuyback,
        configTopic,
        [hasBuybackTopic, topics.buybackCooldown],
        (get, effect) => {
            const hasBuyback = get(hasBuybackTopic)!;
            const buybackCooldown = get(topics.buybackCooldown)!;
            if (!hasBuyback && buybackCooldown === 0) {
                return new Fact(effect, "resources/audio/buyback-warning.mp3");
            }
        }
    ),
];