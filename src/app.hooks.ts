// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.


import {HookContext} from "@feathersjs/feathers";
import logger from "./logger";

export default {
  before: {
    all: [
      (ctx: HookContext) => {
        if (ctx.data && typeof ctx.data === "string") {
          ctx.data = JSON.parse(ctx.data);
        }
        return ctx;
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [
      (ctx: HookContext) => {
        console.log("app.hooks error->all");
        return ctx;
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
