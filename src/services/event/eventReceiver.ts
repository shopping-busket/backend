import { IShoppingListEntries, IShoppingListItem } from "../../shoppinglist/ShoppingList";
import { NotImplemented } from "@feathersjs/errors";
import { Model } from "sequelize";

export interface Event {
  event: EventType,
  entryId: string,
  state: {
    name: string,
    done: boolean,
    aboveEntry?: string,
    belowEntry?: string,
    index?: number,
    oldIndex?: number,
    newIndex?: number,
  },
  isoDate: string,
}

export interface EventData {
  event: Event,
  entries: IShoppingListEntries,
  list?: Model<any, any>
}

export interface EventReceiverData {
  event: Event,
  list: Model<any, any>,
}

export enum EventType {
  MOVE_ENTRY = 'MOVE_ENTRY',
  MOVE_ENTRY_REQUEST = 'MOVE_ENTRY_REQUEST',
  DELETE_ENTRY = 'DELETE_ENTRY',
  CREATE_ENTRY = 'CREATE_ENTRY',
  CHANGED_ENTRY_NAME = 'CHANGED_ENTRY_NAME',
  MARK_ENTRY_DONE = 'MARK_ENTRY_DONE',
  MARK_ENTRY_TODO = 'MARK_ENTRY_TODO',
}

export type NewEntryState = {
  update: {
    entries?: Record<string, any>,
    checkedEntries?: Record<string, any>,
  },
  found: boolean,
};
export type NewEntryStateAsync = Promise<NewEntryState>;

export class EventReceiver {
  public async receive({ event, list }: EventReceiverData): NewEntryStateAsync {
    const entries = list.getDataValue("entries");

    if (event.event === EventType.MARK_ENTRY_TODO || event.event == EventType.MARK_ENTRY_DONE) {
      return await this.markEntryAsDone({ event, entries, list }, false);
    }

    const eventData: EventData = { event, entries };
    let res: NewEntryState = { found: false, update: {} };
    switch (event.event) {
      case EventType.CREATE_ENTRY:
        res = await this.createEntry(eventData);
        break;

      case EventType.MOVE_ENTRY:
        res = await this.moveEntry(eventData);
        break;

      case EventType.MOVE_ENTRY_REQUEST:
        res = await this.moveEntryRequest(eventData);
        break;

      case EventType.DELETE_ENTRY:
        res = await this.deleteEntry(eventData);
        break;

      case EventType.CHANGED_ENTRY_NAME:
        res = await this.renameEntry(eventData);
        break;

      default:
        console.log('Received unknown event type!');
        await Promise.reject('Received unknown event type!');
        break;
    }

    return res;
  }

  async modifyEntryState(eventData: EventData, key: string, val: boolean | string): NewEntryStateAsync {
    const { event, entries } = eventData;
    entries.items.find((t: IShoppingListItem) => t.id === event.entryId)

    let found = false;
    let updated = {};
    for (let i = 0; i < entries.items.length; i++) {
      const entry: IShoppingListItem = entries.items[i];

      if (entry.id === event.entryId) {
        if (key === 'name' && typeof val === 'string') {
          entry.name = val;
        } else if (typeof val === 'boolean') {
          console.log('Deprecation Warn: Action skipped because modifying entry.done is now deprecated. Put it in the checkedEntries list instead.');
        }

        found = true;
        updated = { entries };
      }
    }

    return {
      found,
      update: updated,
    };
  }

  public generateEntryChanges(entries: IShoppingListEntries, found: boolean, isCheckedEntry?: boolean): NewEntryState {
    const changes: NewEntryState = {
      update: {},
      found,
    };

    if (isCheckedEntry != null && isCheckedEntry) {
      changes.update.checkedEntries = entries;
    } else {
      changes.update.entries = entries;
    }

    return changes;
  }

  public createEntry({ event, entries }: EventData, isCheckedEntry?: boolean): NewEntryState {
    entries.items.unshift({ id: event.entryId, ...event.state });

    return this.generateEntryChanges(entries, true, isCheckedEntry);
  }

  public async moveEntry({ event, entries }: EventData): NewEntryStateAsync {
    let found = false;
    try {
      if (event.state.oldIndex == null || event.state.newIndex == null) await Promise.reject('Missing parameters!');
      console.log(event.state);

      entries.items.forEach((t: IShoppingListItem) => {
        if (t.id === event.entryId) {
          const element = entries.items[event.state.oldIndex || 0];
          entries.items.splice(<number>event.state.oldIndex, 1);
          entries.items.splice(<number>event.state.newIndex, 0, element);
          console.log("modified", JSON.stringify(entries, null, 4))
          found = true;
        }
      });
      if (!found) await Promise.reject('Can\'t find item! Wrong id.');

    } catch (e) {
      console.log(e);
      await Promise.reject(e);
    }

    return { found, update: { entries } }
  }

  public async moveEntryRequest({ event, entries }: EventData): NewEntryStateAsync {
    throw new NotImplemented();
  }

  public async deleteEntry({ event, entries }: EventData, isCheckedEntry = false): NewEntryStateAsync {
    let found = false;
    entries.items.forEach((t: IShoppingListItem, i: number) => {
      if (t.id === event.entryId) {
        entries.items.splice(i, 1);
        found = true;
      }
    });

    return this.generateEntryChanges(entries, found, isCheckedEntry);
  }

  public async renameEntry(eventData: EventData): NewEntryStateAsync {
    return this.modifyEntryState(eventData, 'name', eventData.event.state.name);
  }

  public async markEntryAsDone({ entries, event, list }: EventData, markAsDone: boolean): NewEntryStateAsync {
    const checkedEntries = list?.getDataValue("checkedEntries");

    if (markAsDone) {
      await this.deleteEntry({ event, entries }, false);
      return this.createEntry({ event, entries: checkedEntries }, true)
    }

    await this.deleteEntry({ entries: checkedEntries, event }, true);
    return this.createEntry({ event, entries }, false)
  }
}
