import engine from "../customEngine";
import { Fact } from "../Engine";
import PlayerItems from "../PlayerItems";
import topic from "../topic";

engine.register("gsi/items", [topic.gsiData], (get) => {
    const items = get(topic.gsiData)?.items;
    if (items) {
        return new Fact(topic.items, PlayerItems.create(items));
    } else {
        return new Fact(topic.items, undefined);
    }
});
