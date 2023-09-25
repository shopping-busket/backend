import { IShoppingListItem } from '../../shoppinglist/ShoppingList';
import { List } from '../list/list.schema';

export enum EventType {
  MOVE_ENTRY = 'MOVE_ENTRY',
  DELETE_ENTRY = 'DELETE_ENTRY',
  CREATE_ENTRY = 'CREATE_ENTRY',
  CHANGED_ENTRY_NAME = 'CHANGED_ENTRY_NAME',
  MARK_ENTRY_DONE = 'MARK_ENTRY_DONE',
  MARK_ENTRY_TODO = 'MARK_ENTRY_TODO',
}

export interface EntryStateUpdate {
  entries?: Record<string, any>,
  checkedEntries?: Record<string, any>,
}

export type NewEntryState = {
  update: EntryStateUpdate,
  found: boolean,
};

export type ServerInternalItems = { items: IShoppingListItem[] };
export type ServerInternalEntryLists = { entries: ServerInternalItems, checkedEntries: ServerInternalItems };
export type ServerInternalList = List | List & ServerInternalEntryLists;
