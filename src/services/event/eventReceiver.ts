import {
  IShoppingListEntries,
  IShoppingListItem, ShoppingListItem, EntryList,
} from '../../shoppinglist/ShoppingList';
import { NotFound } from '@feathersjs/errors';
import { Model, Sequelize } from 'sequelize';

export interface Event {
  event: EventType,
  entryId: string,
  state: {
    name: string,
    /**
     * @deprecated
     */
    done?: boolean,
    markAsDone?: boolean,
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
  checkedEntries?: IShoppingListEntries,
  list?: Model<any, any>
}

export interface EventReceiverData {
  event: Event,
  list: Model<any, any>,
}

export enum EventType {
  MOVE_ENTRY = 'MOVE_ENTRY',
  DELETE_ENTRY = 'DELETE_ENTRY',
  CREATE_ENTRY = 'CREATE_ENTRY',
  CHANGED_ENTRY_NAME = 'CHANGED_ENTRY_NAME',
  MARK_ENTRY_DONE = 'MARK_ENTRY_DONE',
  MARK_ENTRY_TODO = 'MARK_ENTRY_TODO',
}

export interface RawEventData {
  listid: string,
  eventData: Event,
}

export type NewEntryState = {
  update: {
    entries?: Record<string, any>,
    checkedEntries?: Record<string, any>,
  },
  found: boolean,
};
export type NewEntryStateAsync = Promise<NewEntryState>;

export interface FoundEntry {
  foundIn: EntryList,
  foundObj: ShoppingListItem[],
  index: number,
  entry: FoundEntry
}

export class EventReceiver {
  private sequelizeClient: Sequelize;
  private currentList: Model<any, any> | null = null;

  constructor(sequelizeClient: Sequelize) {
    this.sequelizeClient = sequelizeClient;
  }

  public async receive({ event, list }: EventReceiverData): NewEntryStateAsync {
    const entries = list.getDataValue('entries');
    const checkedEntries = list.getDataValue('checkedEntries');
    this.currentList = list;

    if (event.event === EventType.MARK_ENTRY_TODO || event.event == EventType.MARK_ENTRY_DONE) {
      return await this.markEntryAsDone({
        event,
        entries,
        checkedEntries,
        list
      }, event.event == EventType.MARK_ENTRY_DONE);
    }

    const eventData: EventData = { event, entries, checkedEntries };
    let res: NewEntryState = { found: false, update: {} };
    switch (event.event) {
    case EventType.CREATE_ENTRY:
      res = await this.createEntry(eventData);
      break;

    case EventType.MOVE_ENTRY:
      res = await this.moveEntry(eventData);
      break;

    case EventType.DELETE_ENTRY:
      res = await this.deleteEntry(eventData);
      break;

    case EventType.CHANGED_ENTRY_NAME:
      res = await this.renameEntry(eventData);
      break;

    default:
      await Promise.reject('Received unknown event type!');
      break;
    }

    return res;
  }

  private globalFind(entries: IShoppingListEntries, checkedEntries: IShoppingListEntries, predicate: (value: IShoppingListItem, index: number, obj: IShoppingListItem[], foundInList: EntryList) => unknown): FoundEntry | undefined {
    let index = -1;
    let entry;
    const d = {
      entries,
      checkedEntries,
    };

    ['entries', 'checkedEntries'].every((k: string) => {
      entry = d[k as EntryList].items.find((_v, _i, _obj) => {
        const condition = predicate(_v, _i, _obj, k as EntryList);
        if (condition) index = _i;

        return condition;
      }) as IShoppingListItem;

      if (entry === undefined) return true;
      (entry as unknown as FoundEntry).index = index;
      (entry as unknown as FoundEntry).foundIn = k as EntryList;
      return false;
    });

    return entry;
  }

  async modifyEntryState(eventData: EventData, key: string, val: boolean | string): NewEntryStateAsync {
    const { event, entries } = eventData;
    entries.items.find((t: IShoppingListItem) => t.id === event.entryId);

    let found = false;
    let updated = {};
    for (let i = 0; i < entries.items.length; i++) {
      const entry: IShoppingListItem = entries.items[i];

      if (entry.id === event.entryId) {
        if (key === 'name' && typeof val === 'string') {
          entry.name = val;
        } else if (typeof val === 'boolean') {
          return Promise.reject('Deprecation Warn: Action skipped because modifying entry.done is now deprecated. Put it in the checkedEntries list instead.');
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

      entries.items.forEach((t: IShoppingListItem) => {
        if (t.id === event.entryId) {
          const element = entries.items[event.state.oldIndex || 0];
          entries.items.splice(<number>event.state.oldIndex, 1);
          entries.items.splice(<number>event.state.newIndex, 0, element);
          found = true;
        }
      });
      if (!found) await Promise.reject('Can\'t find item! Wrong id.');

    } catch (e) {
      await Promise.reject(e);
    }

    return { found, update: { entries } };
  }

  public async deleteEntry(eventData: EventData): NewEntryStateAsync {
    if (!eventData.checkedEntries) return Promise.reject('checkedEntries not loaded');

    let found = false;
    const foundEntry = this.globalFind(eventData.entries, eventData.checkedEntries, (t) => t.id === eventData.event.entryId);
    if (foundEntry == null) return Promise.reject('Item not found!');

    eventData[foundEntry.foundIn]?.items.splice(foundEntry.index, 1);
    found = true;

    return this.generateEntryChanges(eventData[foundEntry.foundIn as 'entries'], found, foundEntry.foundIn == 'checkedEntries' || false);
  }

  public async renameEntry(eventData: EventData): NewEntryStateAsync {
    return this.modifyEntryState(eventData, 'name', eventData.event.state.name);
  }

  public async markEntryAsDone({ event, entries, checkedEntries }: EventData, markAsDone: boolean): NewEntryStateAsync {
    if (!checkedEntries) return Promise.reject('checkedEntries is null or undefined!');

    if (markAsDone) {
      await this.applyUpdateIfFound(await this.deleteEntry({ event, entries, checkedEntries }));
      return this.createEntry({ event, entries: checkedEntries }, true);
    }

    await this.applyUpdateIfFound(await this.deleteEntry({ entries, checkedEntries, event }));
    return this.createEntry({ event, entries }, false);
  }

  public async applyUpdateIfFound(newState: NewEntryState, _list?: Model<any, any>) {
    if (newState.found) {
      return this.applyUpdate(newState, _list);
    }
    throw new NotFound('Item not found');
  }

  public async applyUpdate(newState: NewEntryState, _list?: Model<any, any>): Promise<void> {
    await this.sequelizeClient.models.list.update(newState.update, {
      where: {
        listid: this.currentList?.getDataValue('listid') || '',
      },
    }).catch(() => console.log);
  }
}
