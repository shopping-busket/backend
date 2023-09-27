import { Knex } from 'knex';
import { EventData } from './event.schema';
import { BadRequest } from '@feathersjs/errors';
import { EventType } from '../../shoppinglist/events';

export class EventReceiver {
  private postgresClient: Knex<any, any>;

  constructor(postgresClient: Knex<any, any>) {
    this.postgresClient = postgresClient;
  }

  public async receive(data: EventData): Promise<EventData> {
    if (data.eventData.event === EventType.MARK_ENTRY_TODO || data.eventData.event == EventType.MARK_ENTRY_DONE) {
      return this.markEntryAs(data, data.eventData.event == EventType.MARK_ENTRY_DONE);
    }

    switch (data.eventData.event) {
    case EventType.CREATE_ENTRY:
      return this.createEntry(data);

    case EventType.MOVE_ENTRY:
      return await this.moveEntry(data);

    case EventType.DELETE_ENTRY:
      return this.deleteEntry(data);

    case EventType.CLEAR_DONE:
      return this.clearDoneEntries(data);

    case EventType.CHANGED_ENTRY_NAME:
      return this.renameEntry(data);

    default:
      await Promise.reject('Received unknown event type!');
      break;
    }

    return data;
  }

  public async createEntry(data: EventData, isCheckedEntry = false, atIndex = 0): Promise<EventData> {
    await this.postgresClient.raw('UPDATE list SET :col: = jsonb_insert(:col:, \'{items,:atIndex:}\', :data::jsonb) WHERE listId = :listId;', {
      atIndex,
      col: this.getListByCheckedState(isCheckedEntry),
      listId: data.listid,
      data: { id: data.eventData.entryId, name: data.eventData.state.name },
    });
    return data;
  }

  private getListByCheckedState(checked: boolean) {
    return checked ? 'checkedEntries' : 'entries';
  }

  public async deleteEntry(data: EventData, isCheckedEntry = true): Promise<EventData> {
    await this.postgresClient.raw('update list set :col: = jsonb_set(:col:, \'{items}\', (:col:->\'items\') - (select pos - 1 as pos from list, jsonb_array_elements(:col:->\'items\') with ordinality arr(elems, pos) where elems ->> \'id\' = :entryId)::int) where "listid" = :listId;', {
      col: this.getListByCheckedState(isCheckedEntry),
      listId: data.listid,
      entryId: data.eventData.entryId,
    });
    return data;
  }

  public async clearDoneEntries(data: EventData) {
    await this.postgresClient.raw('update list set "checkedEntries" = \'{ \"items\": [] }\'::jsonb where listId = :listId;', {
      listId: data.listid,
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

  public async renameEntry(data: EventData): Promise<EventData> {
    return this.postgresClient.raw('update list set :col: = jsonb_set(:col:::jsonb, (\'{items,\' || (select pos - 1 as pos from list, jsonb_array_elements(:col:->\'items\') with ordinality arr(elems, pos) where elems ->> \'id\' = :entryId)::int || \',name}\')::text[], \':name:\'::jsonb) where listid = :listId;', {
      entryId: data.eventData.entryId,
      col: this.getListByCheckedState(false),
      listId: data.listid,
      name: data.eventData.state.name,
    }).debug(true);
  }

  public async moveEntry(data: EventData): Promise<EventData> {
    if (typeof data.eventData.state.oldIndex !== 'number' || typeof data.eventData.state.newIndex !== 'number') throw new BadRequest('state.oldIndex and state.newIndex have to be type of number and must exist!');
    this.postgresClient.raw('BEGIN;');
    await this.deleteEntry(data, false);
    await this.createEntry(data, false, data.eventData.state.newIndex);
    this.postgresClient.raw('COMMIT;');
    return data;
  }
}
