import { Knex } from 'knex';
import { EventData } from './event.schema';
import { BadRequest, NotFound } from '@feathersjs/errors';
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
    const rows = (await this.postgresClient.raw('select pos - 1 as pos from list, jsonb_array_elements(:col:->\'items\') with ordinality arr(elems, pos) where elems ->> \'id\' = :entryId for update;', {
      col: this.getListByCheckedState(isCheckedEntry),
      entryId: data.eventData.entryId,
    })).rows;
    if (rows.length <= 0) {
      await this.postgresClient.raw('ABORT;');
      throw new NotFound('Entry cannot be found!');
    }
    await this.postgresClient.raw('update list set :col: = jsonb_set(:col:, \'{items}\', (:col:->\'items\') - :index::int) where "listid" = :listId;', {
      col: this.getListByCheckedState(isCheckedEntry),
      listId: data.listid,
      entryId: data.eventData.entryId,
      index: rows[0].pos,
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
    await this.postgresClient.raw('BEGIN;');
    const rows = (await this.postgresClient.raw('select pos - 1 as pos from list, jsonb_array_elements(:col:->\'items\') with ordinality arr(elems, pos) where elems ->> \'id\' = :entryId and "listid" = :listId limit 1 for update;', {
      col: this.getListByCheckedState(!markAsDone),
      entryId: data.eventData.entryId,
      listId: data.listid,
    })).rows;
    if (rows.length <= 0) throw new NotFound(`Entry ${data.eventData.entryId} cannot be found!`);
    await this.postgresClient.raw('update list set :col: = jsonb_set(:col:, \'{items}\', (:col:->\'items\') - :index::int), :toCol: = jsonb_insert(:toCol:, \'{items,:atIndex:}\', :data::jsonb) where "listid" = :listId;', {
      col: this.getListByCheckedState(!markAsDone),
      toCol: this.getListByCheckedState(markAsDone),
      listId: data.listid,
      entryId: data.eventData.entryId,
      index: rows[0].pos,
      atIndex: 0,
      data: { id: data.eventData.entryId, name: data.eventData.state.name },
    });
    await this.postgresClient.raw('COMMIT;');
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
