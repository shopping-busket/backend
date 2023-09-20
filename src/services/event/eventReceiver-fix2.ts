import { EntryList, IShoppingList, IShoppingListItem } from '../../shoppinglist/ShoppingList';
import { Knex } from 'knex';
import { type EventData as Event } from '../../shoppinglist/events';

export interface EventData {
  event: Event,
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
  private postgresClient: Knex<any, any>;

  constructor(postgresClient: Knex<any, any>) {
    this.postgresClient = postgresClient;
  }

  public async receive({ event, list }: EventReceiverData): Promise<EventData> {
    /*
    if (event.event === EventType.MARK_ENTRY_TODO || event.event == EventType.MARK_ENTRY_DONE) {
      return await this.markEntryAsDone({
        event,
        entries,
        checkedEntries,
        list,
        listId: list.listid,
      }, event.event == EventType.MARK_ENTRY_DONE);
    }
     */

    // console.log(await this.postgresClient.raw("select entries '\\?' 'items' from list;"));

    const eventData: EventData = { event, listId: list.listid };
    switch (event.event) {
    case EventType.CREATE_ENTRY:
      return await this.createEntry(eventData);

    case EventType.MOVE_ENTRY:
      // return await this.moveEntry(eventData);
      break;

    case EventType.DELETE_ENTRY:
      break;

//      return await this.deleteEntry(eventData);

    case EventType.CHANGED_ENTRY_NAME:
      break;

      //    return await this.renameEntry(eventData);

    default:
      await Promise.reject('Received unknown event type!');
      break;
    }

    return eventData;
  }

  public async createEntry(eventData: EventData, isCheckedEntry?: boolean): Promise<EventData> {
    const col = isCheckedEntry ? 'checkedEntries' : 'entries';
    // update list set "entries" = jsonb_insert("entries", '{items,0}', '{"name": "test2"}'::jsonb) where id = 0;
    console.log(await this.postgresClient.raw('UPDATE list SET :col: = jsonb_insert(:col:, \'{items,0}\', :data::jsonb) WHERE listId = :listId;', {
      col,
      listId: eventData.listId,
      data: { id: eventData.event.entryId, ...eventData.event.state },
    }));
    return eventData;
    // return this.generateEntryChanges(entries, true, isCheckedEntry);
  }
}
