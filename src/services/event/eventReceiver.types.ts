import { IShoppingListItem } from '../../shoppinglist/ShoppingList';
import { List } from '../list/list.schema';

export type ServerInternalItems = { items: IShoppingListItem[] };
export type ServerInternalEntryLists = { entries: ServerInternalItems, checkedEntries: ServerInternalItems };
export type ServerInternalList = List | List & ServerInternalEntryLists;
