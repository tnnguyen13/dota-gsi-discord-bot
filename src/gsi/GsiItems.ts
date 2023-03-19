import {
    IDota2ObserverState, IDota2State, IItem, IItemContainer,
} from "node-gsi";
import glue from "../glue";
import log from "../log";
import Topic from "../Topics";

class Item {
    id: string;
    name: string;
    cooldown?: number;

    public constructor(id: string, name: string, cooldown?: number) {
        this.id = id;
        this.name = name;
        this.cooldown = cooldown;
    }

    static createFromGsi(item: IItem | null) {
        // TODO find real human readable name from of the item and pass it along in second parameter
        if (item) {
            return new Item(item.name, item.name, item.cooldown);
        }
        return null;
    }
}

class PlayerItems {
    inventory: Array<Item | null> = [];
    stash: Array<Item | null> = [];
    neutral: Item | null = null;
    teleport: Item | null = null;

    constructor(inventory: Array<Item | null>, stash:Array<Item | null>, neutral: Item | null, teleport: Item | null) {
        this.inventory = inventory;
        this.stash = stash;
        this.neutral = neutral;
        this.teleport = teleport;
    }

    static createFromGsi(items: IItemContainer) {
        return new PlayerItems(
            items.slot.map(Item.createFromGsi),
            items.stash.map(Item.createFromGsi),
            Item.createFromGsi(items.neutral),
            Item.createFromGsi(items.teleport)
        );
    }
}

export {
    Item,
    PlayerItems,
};

export default class GsiItems {
    constructor() {
        glue.register(Topic.GSI_DATA, Topic.DOTA_2_ITEMS, this.handleState);
    }

    private handleItems(itemContainer: IItemContainer) {
        log.gsiItems.debug(itemContainer);
        const items = PlayerItems.createFromGsi(itemContainer);
        if (items) {
            return items;
        }
    }

    public handleState(state: IDota2State | IDota2ObserverState): PlayerItems | void {
        if (Array.isArray(state.items)) { // If we are in observer mode
            return this.handleItems(state.items[0]); // Pick the first person
        } else if (state.items) {
            return this.handleItems(state.items);
        }
    }
}

// State
// {"slot":[],"stash":[]}
//
// Observer state
// [
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]},
//     {"slot":[],"stash":[]}
// ]
// For one person
// {
//     slot: [
//       {
//         name: "item_tango",
//         purchaser: 0,
//         passive: false,
//         can_cast: true,
//         cooldown: 0,
//         charges: 2,
//       },
//       null,
//       null,
//       {
//         name: "item_branches",
//         purchaser: 0,
//         passive: false,
//         can_cast: true,
//         cooldown: 0,
//       },
//       {
//         name: "item_magic_stick",
//         purchaser: 0,
//         passive: false,
//         can_cast: false,
//         cooldown: 0,
//         charges: 0,
//       },
//       {
//         name: "item_branches",
//         purchaser: 0,
//         passive: false,
//         can_cast: true,
//         cooldown: 0,
//       },
//       null,
//       null,
//       null,
//     ],
//     stash: [
//       null,
//       null,
//       null,
//       null,
//       null,
//       null,
//     ],
//   }
