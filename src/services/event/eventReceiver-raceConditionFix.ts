import { EntryList, IShoppingList, IShoppingListItem } from '../../shoppinglist/ShoppingList';
import { BadRequest, NotFound } from '@feathersjs/errors';
import { Knex } from 'knex';
import { type EventData as Event } from '../../shoppinglist/events';

export interface EventData {
  event: Event,
  entries: IShoppingListItem[],
  checkedEntries?: IShoppingListItem[],
  list?: IShoppingList,
  listId?: string,
}

export interface EventReceiverData {
  event: Event,
  list: IShoppingList,
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

export interface EntryStateUpdate {
  entries?: Record<string, any>,
  checkedEntries?: Record<string, any>,
}

export type NewEntryState = {
  update: EntryStateUpdate,
  found: boolean,
};
export type NewEntryStateAsync = Promise<NewEntryState>;

export interface FoundEntry {
  foundIn: EntryList,
  foundObj: IShoppingListItem[],
  index: number,
  entry: IShoppingListItem
}

export class EventReceiver {
  private currentList: IShoppingList | null = null;
  private postgresClient: Knex<any, any>;

  constructor(postgresClient: Knex<any, any>) {
    this.postgresClient = postgresClient;
  }

  public async receive({ event, list }: EventReceiverData): NewEntryStateAsync {
    const entries = list.entries;
    const checkedEntries = list.checkedEntries;
    this.currentList = list;

    if (event.event === EventType.MARK_ENTRY_TODO || event.event == EventType.MARK_ENTRY_DONE) {
      return await this.markEntryAsDone({
        event,
        entries,
        checkedEntries,
        list,
        listId: list.listid,
      }, event.event == EventType.MARK_ENTRY_DONE);
    }

    const eventData: EventData = { event, entries, checkedEntries, listId: list.listid };
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

  async modifyEntryState(eventData: EventData, key: string, val: boolean | string): NewEntryStateAsync {
    const { event, entries, checkedEntries } = eventData;
    const foundEntry = this.globalFind(entries, checkedEntries ?? [], (t: IShoppingListItem) => t.id === event.entryId) ?? null;

    let found = false;
    let updated: Partial<EntryStateUpdate> = {};
    if (foundEntry != null) {
      if (key === 'name' && typeof val === 'string') {
        foundEntry.foundObj[foundEntry.index].name = val;
      } else if (typeof val === 'boolean') {
        return Promise.reject('Deprecation Warn: Action skipped because modifying entry.done is now deprecated. Put it in the checkedEntries list instead.');
      }

      found = true;
      updated = { entries };
      updated[foundEntry.foundIn] = foundEntry.foundObj;
    }

    return {
      found,
      update: updated,
    };
  }

  public generateEntryChanges(entries: IShoppingListItem[], found: boolean, isCheckedEntry?: boolean): NewEntryState {
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

  public async createEntry({ event, entries, listId }: EventData, isCheckedEntry?: boolean): Promise<NewEntryState> {
    const col = isCheckedEntry ? 'checkedEntries' : 'entries';
    await this.postgresClient.raw('UPDATE list SET :col: =  array_prepend(:data, :col:) WHERE listId = :listId;', {
      col,
      listId,
      data: { id: event.entryId, ...event.state },
    });
    const newState: NewEntryState = {
      found: true,
      update: {
        entries: [],
        checkedEntries: [],
      },
    };
    newState.update[col] = [{ id: event.entryId, ...event.state }];
    return newState;
    // return this.generateEntryChanges(entries, true, isCheckedEntry);
  }

  public async moveEntry({ event, entries }: EventData): NewEntryStateAsync {
    let found = false;
    if (event.state.oldIndex == undefined || event.state.newIndex == undefined) return Promise.reject('Missing parameters!');

    entries.forEach((t: IShoppingListItem) => {
      if (t.id === event.entryId && !found) {
        if (event.state.oldIndex != null && event.state.newIndex != null) {
          const entry = entries[event.state.oldIndex];

          entries.splice(event.state.oldIndex, 1);
          entries.splice(event.state.newIndex, 0, entry);
          found = true;
        } else {
          throw new BadRequest('Missing parameters! oldIndex, newIndex');
        }
      }
    });
    if (!found) await Promise.reject('Can\'t find item! Wrong id.');

    return { found, update: { entries } };
  }

  public async deleteEntry(eventData: EventData): NewEntryStateAsync {
    if (!eventData.checkedEntries) return Promise.reject('checkedEntries not loaded');

    let found = false;
    const foundEntry = this.globalFind(eventData.entries, eventData.checkedEntries, (t) => t.id === eventData.event.entryId);
    if (foundEntry == null) return Promise.reject('Item not found!');

    eventData[foundEntry.foundIn]?.splice(foundEntry.index, 1);
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

  public async applyUpdateIfFound(newState: NewEntryState) {
    if (newState.found) {
      return this.applyUpdate(newState);
    }
    throw new NotFound('Item not found');
  }

  public async applyUpdate(newState: NewEntryState): Promise<void> {
    if (!this.currentList) return;
    await this.postgresClient('list').where('listid', '=', this.currentList.listid).update(newState.update).catch(console.log);
  }

  private globalFind(entries: IShoppingListItem[], checkedEntries: IShoppingListItem[], predicate: (value: IShoppingListItem, index: number, obj: IShoppingListItem[], foundInList: EntryList) => unknown): FoundEntry | null {
    let index = -1;
    let foundEntry: FoundEntry | null = null;
    const d = {
      entries,
      checkedEntries,
    };

    (['entries', 'checkedEntries'] as EntryList[]).every((k) => {
      let entry = d[k as EntryList].find((_v, _i, _obj) => {
        const condition = predicate(_v, _i, _obj, k as EntryList);
        if (condition) index = _i;

        return condition;
      }) as IShoppingListItem;

      if (entry === undefined) return true;
      foundEntry = {
        entry,
        index,
        foundIn: k,
        foundObj: k === 'entries' ? entries : checkedEntries,
      };
      return false;
    });

    return foundEntry;
  }
}