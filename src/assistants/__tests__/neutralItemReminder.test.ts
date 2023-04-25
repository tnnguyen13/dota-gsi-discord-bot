import { DeepReadonly } from "ts-essentials";
import Item from "../../gsi-data-classes/Item";
import PlayerItems from "../../gsi-data-classes/PlayerItems";
import rule from "../neutralItemReminder";
import rules from "../../rules";

const NEUTRAL_ITEM_REMINDER_START_MINUTE = 10;

const NO_ITEMS = new PlayerItems(
    [],
    [],
    [],
    null,
    null
) as DeepReadonly<PlayerItems>;

const HAS_TIER_2_NEUTRAL_ITEM = new PlayerItems(
    [],
    [],
    [],
    null,
    new Item("item_philosophers_stone", "Philosopher's Stone")
) as DeepReadonly<PlayerItems>;

describe("neutralItemReminder", () => {
    describe("does not have neutral item", () => {
        test("do not warn before 10 minutes", () => {
            const result = getResults(rule, {
                time: (NEUTRAL_ITEM_REMINDER_START_MINUTE - 1) * 60,
                inGame: true,
                items: NO_ITEMS,
            });
            expect(result).toBeUndefined();
        });

        test("warn after 2 minutes grace", () => {
            const state = getResults(rule, {
                [rules.assistant.neutralItemReminder]: "PRIVATE",
                time: NEUTRAL_ITEM_REMINDER_START_MINUTE * 60,
                inGame: true,
                items: NO_ITEMS,
            }) as any;
            const result = getResults(
                rule,
                {
                    [rules.assistant.neutralItemReminder]: "PRIVATE",
                    time: (NEUTRAL_ITEM_REMINDER_START_MINUTE + 2) * 60,
                    inGame: true,
                    items: NO_ITEMS,
                },
                state
            ) as any;
            expect(result).toContainFact(
                "playPrivateAudio",
                "resources/audio/no-neutral.mp3"
            );
            const result2 = getResults(
                rule,
                {
                    [rules.assistant.neutralItemReminder]: "PRIVATE",
                    time: (NEUTRAL_ITEM_REMINDER_START_MINUTE + 4) * 60,
                    inGame: true,
                    items: NO_ITEMS,
                },
                result
            );
            expect(result2).toContainFact(
                "playPrivateAudio",
                "resources/audio/no-neutral.mp3"
            );
        });
    });

    describe("gets neutral item within 1 minute", () => {
        test("should not warn", () => {
            const state1 = getResults(rule, {
                [rules.assistant.neutralItemReminder]: "PRIVATE",
                time: NEUTRAL_ITEM_REMINDER_START_MINUTE * 60,
                inGame: true,
                items: NO_ITEMS,
            }) as any;
            const state2 = getResults(
                rule,
                {
                    [rules.assistant.neutralItemReminder]: "PRIVATE",
                    time: (NEUTRAL_ITEM_REMINDER_START_MINUTE + 1) * 60,
                    inGame: true,
                    items: HAS_TIER_2_NEUTRAL_ITEM,
                },
                state1
            ) as any;
            const result = getResults(
                rule,
                {
                    [rules.assistant.neutralItemReminder]: "PRIVATE",
                    time: 9 * 60,
                    inGame: true,
                    items: HAS_TIER_2_NEUTRAL_ITEM,
                },
                state2
            );
            expect(result).toBeUndefined();
        });
    });

    describe("has a neutral item", () => {
        describe("is an appropriate tier", () => {
            test("do not remind", () => {
                const state1 = getResults(rule, {
                    [rules.assistant.neutralItemReminder]: "PRIVATE",
                    time: 28 * 60, // Tier 3 zone
                    inGame: true,
                    items: HAS_TIER_2_NEUTRAL_ITEM,
                }) as any;
                const state2 = getResults(
                    rule,
                    {
                        [rules.assistant.neutralItemReminder]: "PRIVATE",
                        time: 30 * 60, // Tier 3 zone
                        inGame: true,
                        items: HAS_TIER_2_NEUTRAL_ITEM,
                    },
                    state1
                ) as any;
                expect(state2).not.toContainTopic("playPrivateAudio");
            });
        });
        describe("is 2 below the current tier of items", () => {
            test("remind to get a better neutral", () => {
                const state1 = getResults(rule, {
                    [rules.assistant.neutralItemReminder]: "PRIVATE",
                    time: 38 * 60, // Tier 4 zone
                    inGame: true,
                    items: HAS_TIER_2_NEUTRAL_ITEM,
                }) as any;
                const state2 = getResults(
                    rule,
                    {
                        [rules.assistant.neutralItemReminder]: "PRIVATE",
                        time: 40 * 60, // Tier 4 zone
                        inGame: true,
                        items: HAS_TIER_2_NEUTRAL_ITEM,
                    },
                    state1
                ) as any;
                expect(state2).toContainFact(
                    "playPrivateAudio",
                    "You should upgrade your neutral item"
                );
            });
        });
    });
});
