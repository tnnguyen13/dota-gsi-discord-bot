import { EffectConfig } from "../effectConfigManager";
import Fact from "../engine/Fact";
import Rule from "../engine/Rule";
import RuleConfigurable from "../engine/RuleConfigurable";
import RuleDecoratorInGame from "../engine/RuleDecoratorInGame";
import RuleDecoratorStartAndEndMinute from "../engine/RuleDecoratorStartAndEndMinute";
import rules from "../rules";
import topicManager from "../engine/topicManager";
import topics from "../topics";

export const configTopic = topicManager.createConfigTopic("Buyback");
export const defaultConfig = EffectConfig.PRIVATE;
export const assistantDescription =
    "Reminds you when you do not have enough gold for buyback (after 30:00)";

const hasBuybackTopic = topicManager.createTopic<boolean>("hasBuybackTopic");

export default [
    new RuleDecoratorStartAndEndMinute(
        30,
        undefined,
        new Rule(
            rules.assistant.buyback.availability,
            [topics.gold, topics.buybackCost, topics.buybackCooldown],
            (get) => {
                const buybackAvailable = get(topics.buybackCooldown)! === 0;
                const gold = get(topics.gold)!;
                const buybackCost = get(topics.buybackCost)!;
                if (buybackAvailable) {
                    const hasBuyback = gold >= buybackCost;
                    return new Fact(hasBuybackTopic, hasBuyback);
                } else {
                    return new Fact(hasBuybackTopic, false);
                }
            }
        )
    ),
    new RuleConfigurable(
        configTopic,
        new Rule(
            rules.assistant.buyback.warnNoBuyback,
            [hasBuybackTopic, topics.buybackCooldown],
            (get) => {
                const hasBuyback = get(hasBuybackTopic)!;
                const buybackCooldown = get(topics.buybackCooldown)!;
                if (!hasBuyback && buybackCooldown === 0) {
                    return new Fact(
                        topics.effect,
                        "resources/audio/buyback-warning.mp3"
                    );
                }
            }
        )
    ),
].map((rule) => new RuleDecoratorInGame(rule));
