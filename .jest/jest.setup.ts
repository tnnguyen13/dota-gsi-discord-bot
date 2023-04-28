/* eslint-disable max-statements */
import Fact from "../src/engine/Fact";
import Rule from "../src/engine/Rule";
import Topic from "../src/engine/Topic";
import Engine from "../src/engine/Engine";
import FactStore from "../src/engine/FactStore";

/* eslint-disable sort-keys */
expect.extend({
    toBeWithinRange(actual, min, max) {
        if (typeof actual !== "number") {
            throw new Error("Actual value must be a number");
        }

        const pass = actual >= min && actual <= max;

        return {
            pass,
            message: pass
                ? () =>
                      `expected ${actual} not to be within range (${min}..${max})`
                : () =>
                      `expected ${actual} to be within range (${min}..${max})`,
        };
    },

    setContaining(actual, expected) {
        if (!(actual instanceof Set)) {
            throw new Error("Actual value must be a Set");
        }

        const pass = expected.every((item) => actual.has(item));

        return {
            pass,
            message: pass
                ? () => `expected Set not to contain ${expected.join(", ")}`
                : () => `expected Set to contain ${expected.join(", ")}`,
        };
    },

    toContainFact(actual, label, value) {
        if (label === undefined) {
            return (expect as any).toContainTopic(actual, value);
        }
        if (actual === undefined) {
            return {
                pass: false,
                message: () => "Did not recieve any Fact. Recieved undefined",
            };
        }
        const actualArr = Array.isArray(actual) ? actual : [actual];
        const factArray = actualArr.filter((fact) => fact instanceof Fact);
        if (factArray.length === 0) {
            return {
                pass: false,
                message: () =>
                    `Received ${JSON.stringify(
                        actual
                    )}. Expected to recieve at least one Fact objects`,
            };
        }

        const factsMatchingTopic = (actualArr as Fact<unknown>[]).filter(
            (f) => f.topic.label === label
        );

        let message: string;
        const factExists = factsMatchingTopic.length > 0;
        message = factExists
            ? `Fact ${label} exists `
            : `Fact ${label} does not exist `;
        const correctValue = factsMatchingTopic.reduce((memo, fact) => {
            return memo || this.equals(fact.value, value);
        }, false);
        message += correctValue
            ? `with value ${value}`
            : `with incorrect value(s) ${factsMatchingTopic
                  .map((fact) => fact.value)
                  .join(", ")} (expected ${value})`;
        const pass = factExists && correctValue;

        return {
            pass,
            message: pass
                ? () => `${message}. Expected to contain no such fact.`
                : () => `${message}`,
        };
    },

    toContainTopic(actual, label) {
        if (actual === undefined) {
            return {
                pass: false,
                message: () => "Did not recieve any Topics. Recieved undefined",
            };
        }
        const actualArr = Array.isArray(actual) ? actual : [actual];
        const factArray = actualArr.filter((fact) => fact instanceof Fact);
        if (factArray.length === 0) {
            return {
                pass: false,
                message: () => "Did not recieve any Topics. Recieved []",
            };
        }

        const fact = (actualArr as Fact<unknown>[]).find(
            (f) => f.topic.label === label
        );

        const pass = fact !== undefined;

        return {
            pass,
            message: pass
                ? () =>
                      `Topic ${label} exists. Expected to contain no such topic.`
                : () => `Topic ${label} does not exist`,
        };
    },
});

// NOTE: Cannot re-use the existing code in PersistentFactStore
// because the import will mess with jest.mock("topicManager")
// becuase we will need to use the real topic manager
function factsToPlainObject(facts: Fact<unknown>[]) {
    return facts.reduce((memo: { [key: string]: unknown }, fact) => {
        memo[fact.topic.label] = fact.value;
        return memo;
    }, {});
}

function plainObjectToFacts(object: { [key: string]: unknown }) {
    return Object.entries(object).reduce(
        (memo: Fact<unknown>[], [topicLabel, value]) => {
            memo.push(new Fact(new Topic(topicLabel), value));
            return memo;
        },
        []
    );
}

function getResults(
    rule: Rule | Rule[],
    db: { [keys: string]: unknown },
    previousState?: Fact<unknown>[] | Fact<unknown> | undefined,
    debug?: boolean
): Fact<unknown>[] {
    const engine = new Engine();
    if (Array.isArray(rule)) {
        rule.forEach((r) => engine.register(r));
    } else {
        engine.register(rule);
    }
    const factStore = new FactStore();
    const newFacts = plainObjectToFacts(db);
    if (previousState) {
        if (Array.isArray(previousState)) {
            previousState.forEach((fact) => factStore.set(fact));
        } else {
            factStore.set(previousState);
        }
    }
    newFacts.forEach((fact) => engine.set(factStore, fact));
    const result = factStore.getAllFacts();
    if (debug) {
        console.log("input:", db, "\n\noutput:", factsToPlainObject(result));
    }
    return result;
}

global.getResults = getResults as any;
