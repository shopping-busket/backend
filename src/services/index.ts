import { Application } from '../declarations';
import users from './users/users.service';
import list from './list/list.service';
import relations from './relations/relations.service';
import event from './event/event.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(list);
  app.configure(relations);
  app.configure(event);
}
