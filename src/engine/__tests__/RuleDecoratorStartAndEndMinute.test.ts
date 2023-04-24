import Fact from "../Fact";
import Rule from "../Rule";
import RuleDecoratorStartAndEndMinute from "../RuleDecoratorStartAndEndMinute";
import Topic from "../Topic";

describe("RuleDecoratorStartAndEndMinute", () => {
    let rule: RuleDecoratorStartAndEndMinute;
    let topic: Topic<boolean>;

    describe("handling start time 0", () => {
        beforeEach(() => {
            topic = new Topic<boolean>("hasTriggeredClosure");
            rule = new RuleDecoratorStartAndEndMinute(
                0,
                4,
                new Rule("test", [topic], (get) => new Fact(topic, true))
            );
        });
        describe("in game", () => {
            test("does not trigger then closure", () => {
                const results = getResults(rule, { inGame: true, time: 0 });
                expect(results).toBeUndefined();
            });
        });
    });

    describe("handling starting time > 0", () => {
        beforeEach(() => {
            topic = new Topic<boolean>("hasTriggeredClosure");
            rule = new RuleDecoratorStartAndEndMinute(
                2,
                4,
                new Rule("test", [topic], (get) => new Fact(topic, true))
            );
        });
        describe("in game", () => {
            describe("triggers then closure", () => {
                test("minimum time", () => {
                    const results = getResults(rule, {
                        inGame: true,
                        time: 2 * 60,
                    });
                    expect(results).toContainFact("hasTriggeredClosure", true);
                });
                test("in between time", () => {
                    const results = getResults(rule, {
                        inGame: true,
                        time: 3 * 60,
                    });
                    expect(results).toContainFact("hasTriggeredClosure", true);
                });
                test("maximum time", () => {
                    const results = getResults(rule, {
                        inGame: true,
                        time: 4 * 60,
                    });
                    expect(results).toContainFact("hasTriggeredClosure", true);
                });
            });
            describe("does not trigger then closure", () => {
                test("prior to start time", () => {
                    const results = getResults(rule, {
                        inGame: true,
                        time: 1 * 60,
                    });
                    expect(results).toBeUndefined();
                });
                test("after end time", () => {
                    const results = getResults(rule, {
                        inGame: true,
                        time: 5 * 60,
                    });
                    expect(results).toBeUndefined();
                });
            });
        });
        describe("not in game, proper time", () => {
            test("should not trigger then closure", () => {
                const results = getResults(rule, {
                    inGame: false,
                    time: 3 * 60,
                });
                expect(results).toBeUndefined();
            });
        });
    });
});