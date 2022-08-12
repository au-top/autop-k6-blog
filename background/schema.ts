
import { list } from '@keystone-6/core';

import {
  text,
  relationship,
  password,
  timestamp,
  select,
  virtual,
} from '@keystone-6/core/fields';
import { document } from '@keystone-6/fields-document';
import { Lists } from '.keystone/types';
import { BaseFields, BaseItem, BaseListTypeInfo, CreateListItemAccessControl, DeleteListItemAccessControl, KeystoneContextFromListTypeInfo, ListConfig, ListFilterAccessControl, ListOperationAccessControl, UpdateListItemAccessControl } from '@keystone-6/core/types';
import { graphql } from '@graphql-ts/schema';

interface SessionData {
  itemId: string,
  data: {
    rule: string
  }
}

type Session = SessionData | undefined;

enum UserRule {
  Admin = "admin",
  Author = "author",
}

function isUser(session: Session) {
  return session?.data != undefined;
}

function isAdmin(session: Session) {
  return isUser(session) && session?.data.rule === UserRule.Admin
}

function isAuthor(session: Session) {
  return isUser(session) && session?.data.rule === UserRule.Author
}

function isHe(session: Session, id: string | undefined) {
  return isUser(session) && session?.itemId === id && id != undefined
}

namespace OperationAccessControl {
  export const needLogin: ListOperationAccessControl<any, any> = (options) => {
    return isUser(options?.session);
  };
}



interface User {
  name: string,
  email: string,
  password: string,
  posts: string[],
  rule: UserRule,
}

enum PostPushState {
  Published = 'published',
  Draft = 'draft',
}

export const lists: Lists = {

  User: list({
    access: {
      operation: {
        query: OperationAccessControl.needLogin,
        delete: OperationAccessControl.needLogin,
        update: OperationAccessControl.needLogin,
        create: OperationAccessControl.needLogin,
      },
      item: {
        create: (options) => isAdmin(options.session),
        update: (options) => isHe(options.session, options.item.id) || isAdmin(options.session),
        delete: (options) => isHe(options.session, options.item.id) || isAdmin(options.session),
      },
      filter: {
        // query: (options) => {
        //   if (isAdmin(options.session)) return true;
        //   return {
        //     OR: [
        //       {
        //         id: {
        //           equals: (options.session as Session)!.itemId,
        //         },
        //       },
        //       {
        //         rule: {
        //           equals: UserRule.Admin
        //         }
        //       }
        //     ]
        //   };
        // },
      },
    },
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({
        validation: { isRequired: true },
        isIndexed: 'unique',
        isFilterable: true,
      }),
      password: password({
        validation: { isRequired: true }
      }),
      mainPosts: relationship({ ref: 'Post.mainAuthors', many: true }),
      posts: relationship({ ref: 'Post.authors', many: true }),
      rule: select({
        options: [
          {
            label: "管理员",
            value: UserRule.Admin
          },
          {
            label: "内容发布者",
            value: UserRule.Author
          },
        ],
        defaultValue: UserRule.Author,
        access: {
          update: (options) => isAdmin(options.session),
        }
      }),
    },
    ui: {
      listView: {
        initialColumns: ['name', 'posts', 'rule'],
      },
    },
  }),

  Post: list({
    access: {
      operation: {
        create: (options) => isAdmin(options.session) || isAuthor(options.session),
        delete: (options) => isAdmin(options.session) || isAuthor(options.session),
        update: (options) => isAdmin(options.session) || isAuthor(options.session),
      },
      filter: {
        delete: (options) => {
          if (isAdmin(options.session)) return true;
          return {
            mainAuthors: {
              some: {
                id: {
                  equals: (options.session as Session)!.itemId,
                },
              }
            },
          };
        }
      }
    },

    fields: {
      title: text({
        validation: {
          isRequired: true, length: {
            max: 30,
            min: 10
          },
        },
      }),

      status: select({
        options: [
          { label: 'Published', value: PostPushState.Published },
          { label: 'Draft', value: PostPushState.Draft },
        ],
        defaultValue: PostPushState.Draft,
        ui: {
          displayMode: 'segmented-control',
        },
        validation: {
          isRequired: true,
        },
      }),

      isPublished: virtual({
        field: graphql.field({
          type: graphql.Boolean,
          resolve(item) {
            return item.status == PostPushState.Published;
          }
        })
      }),

      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      publishDate: timestamp({
        defaultValue: {
          kind: "now"
        }
      }),

      mainAuthors: relationship({
        ref: 'User.mainPosts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          linkToItem: true,
          inlineConnect: true,
        },
        many: true,
      }),

      authors: relationship({
        ref: 'User.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          linkToItem: true,
          inlineConnect: true,
        },
        many: true
      }),

      tags: relationship({
        ref: 'Tag.posts',
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          linkToItem: true,
          inlineConnect: true,
        },
        many: true,
      }),

    },
    ui: {
      listView: {
        initialColumns: ["title", "tags", "isPublished", "publishDate", "mainAuthors", "authors",],
      }
    }
  }),

  Tag: list({

    access: {
      operation: {
        create: OperationAccessControl.needLogin,
        update: OperationAccessControl.needLogin,
        delete: OperationAccessControl.needLogin,
      }
    },

    fields: {
      name: text(),
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),

};