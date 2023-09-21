import { EntryList, IShoppingListItem } from '../../shoppinglist/ShoppingList';
import { Knex } from 'knex';
import { EventData } from './event.schema';
import { List } from '../list/list.schema';


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

export type ServerInternalItems = { items: IShoppingListItem[] };
export type ServerInternalEntryLists = { entries: ServerInternalItems, checkedEntries: ServerInternalItems };
export type ServerInternalList = List | List & ServerInternalEntryLists;

export class EventReceiver {
  private postgresClient: Knex<any, any>;

  constructor(postgresClient: Knex<any, any>) {
    this.postgresClient = postgresClient;
  }

  public async receive(data: EventData): Promise<EventData> {
    if (data.eventData.event === EventType.MARK_ENTRY_TODO || data.eventData.event == EventType.MARK_ENTRY_DONE) {
      return this.markEntryAs(data, data.eventData.event == EventType.MARK_ENTRY_DONE);
    }

    // console.log(await this.postgresClient.raw("select entries '\\?' 'items' from list;"));

    switch (data.eventData.event) {
    case EventType.CREATE_ENTRY:
      return this.createEntry(data);

    case EventType.MOVE_ENTRY:
      // return await this.moveEntry(eventData);
      break;

    case EventType.DELETE_ENTRY:
      return this.deleteEntry(data);

    case EventType.CHANGED_ENTRY_NAME:
      break;

      //    return await this.renameEntry(eventData);

    default:
      await Promise.reject('Received unknown event type!');
      break;
    }

    return data;
  }

  public async createEntry(data: EventData, isCheckedEntry?: boolean): Promise<EventData> {
    await this.postgresClient.raw('UPDATE list SET :col: = jsonb_insert(:col:, \'{items,0}\', :data::jsonb) WHERE listId = :listId;', {
      col: this.getListByCheckedState(isCheckedEntry ?? false),
      listId: data.listid,
      data: { id: data.eventData.entryId, name: data.eventData.state.name },
    });
    return data;
  }

  public async deleteEntry(data: EventData, isCheckedEntry?: boolean): Promise<EventData> {
    await this.postgresClient.raw('update list set :col: = jsonb_set(:col:, \'{items}\', (:col:->\'items\') - (select pos - 1 as pos from list, jsonb_array_elements(:col:->\'items\') with ordinality arr(elems, pos) where elems ->> \'id\' = :entryId)::int) where "listid" = :listId;', {
      col: this.getListByCheckedState(isCheckedEntry ?? true),
      listId: data.listid,
      entryId: data.eventData.entryId,
    });
    return data;
  }

  public async markEntryAs(data: EventData, markAsDone: boolean): Promise<EventData> {
    this.postgresClient.raw('BEGIN;');
    await this.deleteEntry(data, !markAsDone);
    await this.createEntry(data, markAsDone);
    this.postgresClient.raw('COMMIT;');
    return data;
  }

  private getListByCheckedState(checked: boolean) {
    return checked ? 'checkedEntries' : 'entries';
  }
}
