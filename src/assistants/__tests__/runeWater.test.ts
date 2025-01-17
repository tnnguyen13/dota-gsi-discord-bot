import rule from "../runeWater";
import rules from "../../rules";

const params = {
    [rules.assistant.runeWater]: "PRIVATE",
    inGame: true,
};
describe("water runes, in game", () => {
    describe("time 2:00", () => {
        test("play rune sound", () => {
            const results = getResults(rule, {
                ...params,
                time: 2 * 60,
            });
            expect(results).toContainAudioEffect(
                "resources/audio/rune-water.mp3"
            );
        });
    });
    describe("time 4:00", () => {
        test("play rune sound", () => {
            const results = getResults(rule, {
                ...params,
                time: 4 * 60,
            });
            expect(results).toContainAudioEffect(
                "resources/audio/rune-water.mp3"
            );
        });
    });
    describe("time 6:00", () => {
        test("do not play rune sound", () => {
            const results = getResults(rule, {
                ...params,
                time: 6 * 60,
            });
            expect(results).not.toContainAudioEffect();
        });
    });
});
