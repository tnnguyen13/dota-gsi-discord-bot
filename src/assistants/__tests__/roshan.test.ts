import Event, { EventType } from "../../gsi-data-classes/Event";
import { getResults } from "../../__tests__/helpers";
import roshanRules from "../roshan";
import rules from "../../rules";

const killedRule = roshanRules.find(
    (rule) => rule.label === rules.assistant.roshan.killedEvent
)!;
const maybeAliveRule = roshanRules.find(
    (rule) => rule.label === rules.assistant.roshan.maybeAliveTime
)!;
const aliveRule = roshanRules.find(
    (rule) => rule.label === rules.assistant.roshan.aliveTime
)!;
const voiceRule = roshanRules.find(
    (rule) => rule.label === rules.assistant.roshan.voice
)!;

describe("roshan", () => {
    describe("not in a game", () => {
        test("voice should return we are not in a game", () => {
            const results = getResults(voiceRule, {
                Roshan: "PUBLIC",
                inGame: false,
                lastDiscordMessage: "What is rosh status",
            });
            expect(results).toContainFact(
                "playPublicAudio",
                "You are not in a game"
            );
        });
    });

    describe("not asking about rosh", () => {
        test("voice should return nothing", () => {
            const results = getResults(voiceRule, {
                Roshan: "PUBLIC",
                inGame: false,
                lastDiscordMessage: "The sky is blue",
            });
            expect(results).toBeUndefined();
        });
    });

    describe("in game", () => {
        test("voice should return roshan is alive", () => {
            const results = getResults(voiceRule, {
                Roshan: "PUBLIC",
                inGame: true,
                time: 1,
                lastDiscordMessage: "What's roshan timer",
            });
            expect(results).toContainFact("playPublicAudio", "Roshan is alive");
        });
        describe("roshan killed", () => {
            let roshKilledState: any;

            beforeEach(() => {
                roshKilledState = getResults(killedRule, {
                    time: 100,
                    inGame: true,
                    events: [new Event(EventType.RoshanKilled, 200)],
                }) as any;
            });

            test("voice should say rosh is dead until 8:00 after killed event", () => {
                const results = getResults(
                    voiceRule,
                    {
                        Roshan: "PUBLIC",
                        inGame: true,
                        lastDiscordMessage: "what time",
                        time: 100 + 7 * 60,
                    },
                    roshKilledState
                );
                expect(results).toContainFact(
                    "playPublicAudio",
                    expect.stringContaining("Roshan is dead")
                );
            });

            test("play maybe audio 8 minutes from now", () => {
                const results = getResults(
                    maybeAliveRule,
                    {
                        Roshan: "PUBLIC",
                        inGame: true,
                        time: 100 + 8 * 60,
                    },
                    roshKilledState
                );
                expect(results).toContainFact(
                    "playPublicAudio",
                    "resources/audio/rosh-maybe.mp3"
                );
            });

            test("voice should say rosh may be alive until 11:00 after killed event", () => {
                const results = getResults(
                    voiceRule,
                    {
                        Roshan: "PUBLIC",
                        inGame: true,
                        lastDiscordMessage: "what status",
                        time: 100 + 10 * 60,
                    },
                    roshKilledState
                );
                expect(results).toContainFact(
                    "playPublicAudio",
                    expect.stringContaining("Roshan may be alive")
                );
            });

            test("play alive audio 11 minutes from now", () => {
                const results = getResults(
                    aliveRule,
                    {
                        Roshan: "PUBLIC",
                        inGame: true,
                        time: 100 + 11 * 60,
                    },
                    roshKilledState
                );
                expect(results).toContainFact(
                    "playPublicAudio",
                    "resources/audio/rosh-alive.mp3"
                );
            });

            test("voice should say rosh is alive 11:00 after killed event", () => {
                const results = getResults(
                    voiceRule,
                    {
                        Roshan: "PUBLIC",
                        inGame: true,
                        lastDiscordMessage: "Whats roshan time",
                        time: 100 + 12 * 60,
                    },
                    roshKilledState
                );
                expect(results).toContainFact(
                    "playPublicAudio",
                    "Roshan is alive"
                );
            });
        });
    });
});
