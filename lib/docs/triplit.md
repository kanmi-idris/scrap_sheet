Existing projects
If you have an existing project, you can install the triplit init command to create the necessary files and folders and install the required dependencies.

pnpm add --save-dev @triplit/cli

Follow the instructions in the React + Vite tutorial to finish your setup. The tutorial uses React but is applicable to any framework.

Create your Schema
You'll find a schema already setup in your project. You can modify this file to define the collections in your database. To learn more about schemas, check out the schema guide.

Configure your client
To sync with a Triplit server, your frontend needs a TriplitClient. Create a client.ts file in your triplit folder and export a client.

triplit.ts
import { TriplitClient } from '@triplit/client';
import { schema } from './schema';
 
export const triplit = new TriplitClient({
  schema,
  serverUrl: 'http://localhost:6543',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ4LXRyaXBsaXQtdG9rZW4tdHlwZSI6InNlY3JldCIsIngtdHJpcGxpdC1wcm9qZWN0LWlkIjoibG9jYWwtcHJvamVjdC1pZCJ9.8Z76XXPc9esdlZb2b7NDC7IVajNXKc4eVcPsO7Ve0ug',
});

This snippet is configured to connect with a default local development server. Once you've deployed your own server or are using Triplit Cloud, you'll need to update the serverUrl and token fields and store them as environmental variables.

Setup your dev server
Triplit has a robust local development environment that you can set up with a single command.

npx triplit dev

The dev command will start a local Triplit server with your schema applied. To learn more about the dev server, check out the local development guide.

Insert and Query Data
To add data to your database you can use the pre-configured client to insert data.

import { triplit } from '../triplit/client.ts';
 
await triplit.insert('todos', { text });
To run a query and subscribe to changes to that query, you can use subscribe.

import { triplit } from '../triplit/client.ts';
 
const query = triplit.query('todos').Where('completed', '=', false);
 
const unsubscribe = triplit.subscribe(query, (data) => {
  console.log(data);
});
There are also specific bindings a number of popular frameworks like React and Svelte that you can use to interact with your data. See the Frameworks section for a full list of supported integrations and details on usage.

Deploy
When you're ready to go live, you'll need Triplit Server running. Check out the other guides to learn how you can self host your own instance.

With your server running and your .env setup, you can now push your schema to the server

npx triplit schema push

That's it! But there's a lot more you can do with Triplit. Check out the rest of the docs to learn more about how to define relations in your schema, write transactions, add access control, and more.

Triplit 1.0 is here. It's a major upgrade that includes significant improvements to performance and reliability. There are also several improvements to the API, including:

Simplified query syntax and the removal of .build() from the query builder API
More type hinting when defining permissions and relations in a schema.
Easier self-hosted server setup with fewer required environment variables.
Because Triplit 1.0 uses a new data storage format and redesigned sync protocol, client and server must be updated in tandem, and neither will be backwards compatible with their pre-1.0 counterparts. The server upgrade involves a data migration. If you're using Triplit Cloud, we'll handle this for you when you're ready to upgrade. If you're self-hosting, you can follow the instructions in the server upgrade section below.

Query builder
Capitalization and .build()
Anywhere you have a Triplit query defined in your app, you'll need to make some subtle updates. Every builder method (e.g. .Where, .Select, .Include) is now capitalized. In addition, you no longer need to call .build() at the end of your query. Here's an example of a query before and after the upgrade:

Before:

const query = triplit
  .query('todos')
  .where('completed', '=', false)
  .order('created_at', 'ASC')
  .include('assignee')
  .build();
After:

const query = triplit
  .query('todos')
  .Where('completed', '=', false)
  .Order('created_at', 'ASC')
  .Include('assignee');
SyncStatus
The SyncStatus parameter has been changed from a query builder method to an option on TriplitClient.subscribe and TriplitClient.fetch and their permutations (e.g. fetchOne, fetchById).

Before:

const unsyncedTodosQuery = triplit.query('todos').syncStatus('pending').build();
 
const result = triplit.fetch(unsyncedTodosQuery);
const unsubscribeHandler = triplit.subscribe(unsyncedTodosQuery, (result) => {
  console.log(result);
});
After:

const unsyncedTodosQuery = triplit.query('todos');
 
const result = triplit.fetch(unsyncedTodosQuery, {
  syncStatus: 'pending',
});
const unsubscribeHandler = triplit.subscribe(
  unsyncedTodosQuery,
  (result) => {
    console.log(result);
  },
  undefined,
  {
    syncStatus: 'pending',
  }
);
subquery builder method
The .subquery builder method has been replaced with two new methods: .SubqueryOne and .SubqueryMany. Previously the .subquery method required a cardinality parameter to specify whether the subquery was for a single or multiple entities. These new methods are more explicit and provide better type hinting.

Before:

const query = triplit
  .query('todos')
  .subquery(
    'assignee',
    triplit.query('users').where('name', '=', 'Alice').build(),
    'one'
  )
  .build();
After:

const query = triplit
  .query('todos')
  .SubqueryOne('assignee', triplit.query('users').Where('name', '=', 'Alice'));
Schema
Reorganized schema sections and better type hinting
Relations in your schema are now defined in a relationships section. This makes it easier to see at a glance how your data is connected, and provides better type hinting when you're working with your schema.

The ClientSchema type has been removed in favor of an S.Collections method that gives better type hinting when defining your schema.

Here's an example of a schema before and after the upgrade:

Before:

import { Schema as S, type ClientSchema } from '@triplit/client';
 
const schema = {
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean(),
      assigneeId: S.String(),
      assignee: S.RelationById('users', '$1.assigneeId'),
    }),
  },
  users: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
    }),
  },
} satisfies ClientSchema;
After:

import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean(),
      assigneeId: S.String(),
    }),
    relationships: {
      assignee: S.RelationById('users', '$1.assigneeId'),
    },
  },
  users: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
    }),
  },
});
New S.Default.Set.empty() option
The S.Default.Set.empty() is a new option for the default option in a Set attribute. Here's how to use it:

import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean(),
      tags: S.Set(S.String(), { default: S.Default.Set.empty() }),
    }),
  },
});
Changed type helpers
The EntityWithSelection type, previously used to extract an entity from the schema with a specific selection, has been replaced with a QueryResult type. This new type is more flexible and provides better type hinting when working with your schema.

Before:

import { type EntityWithSelection } from '@triplit/client';
import { schema } from './schema';
 
type UserWithPosts = EntityWithSelection<
  typeof schema,
  'users', // collection
  ['name'], // selection
  { posts: true } // inclusions
>;
After:

import { type QueryResult } from '@triplit/client';
import { schema } from './schema';
import { triplit } from './client';
 
type UserWithPosts = QueryResult<
  typeof schema,
  { collectionName: 'users'; select: ['name']; include: { posts: true } }
>;
Client configuration
storage changed
The storage option in the TriplitClient no longer accepts an object with cache and outbox properties. Instead, you can continue to pass in the simple string values memory or indexeddb, or in the uncommon case that you are creating your own storage provider, an instance of a KVStore (which is a new interface in Triplit 1.0). If you need to specify a name for your IndexedDB database, you can pass in an object with a type property set to 'indexeddb' and a name property set to the desired name of your database.

Before:

import { TriplitClient } from '@triplit/client';
import { IndexedDbStorage } from '@triplit/db/storage/indexed-db';
 
const client = new TriplitClient({
  storage: {
    outbox: new IndexedDBStorage('my-database-outbox'),
    cache: new IndexedDBStorage('my-database-cache'),
  },
});
After:

import { TriplitClient } from '@triplit/client';
const client = new TriplitClient({
  storage: {
    type: 'indexeddb',
    name: 'my-database',
  },
});
 
// also works if you don't need to specify a name
const client = new TriplitClient({
  storage: 'indexeddb',
});
Storage imports
If you chose to import storage providers directly, previously our storage providers were only exported from @triplit/db, so you needed to install @triplit/db alongside @triplit/client. Providers are now directly exported by @triplit/client.

Before:

import { TriplitClient } from '@triplit/client';
import { IndexedDbStorage } from '@triplit/db/storage/indexed-db';
 
const client = new TriplitClient({
  storage: {
    outbox: new IndexedDBStorage('my-database-outbox'),
    cache: new IndexedDBStorage('my-database-cache'),
  },
});
After:

import { TriplitClient } from '@triplit/client';
import { IndexedDbStorage } from '@triplit/client/storage/indexed-db';
 
const client = new TriplitClient({
  storage: new IndexedDbStorage('my-database'),
});
For most purposes, you should only need to install @triplit/client.

experimental.entityCache removed
The experimental.entityCache option has been removed from the TriplitClient configuration. This option is no longer needed in Triplit 1.0.

Client methods
Deleting optional attributes
Previously, deleting an optional attribute in the TriplitClient.update method would remove the key from the entity. Any attribute wrapped in S.Optional would be of type T | undefined.

Now, deleting an optional attribute will set the attribute to null, and the attribute will be of type T | undefined | null.

insert, update, delete, transact return types changed
These methods no longer return a { txId, output } object. Instead, if they have an output, e.g. insert, they return it directly.

Before:

import { triplit } from './client';
 
// output is the inserted entity
const { txId, output } = await triplit.insert('todos', {
  id: '1',
  text: 'Buy milk',
});
const { txId } = await triplit.update('todos', '1', (e) => {
  e.text = 'Buy buttermilk';
});
const { txId } = await triplit.delete('todos', '1');
After:

import { triplit } from './client';
 
const output = await triplit.insert('todos', { text: 'Buy milk' });
 
// these methods have no return value
await triplit.update('todos', '1', (e) => {
  e.text = 'Buy buttermilk';
});
await triplit.delete('todos', '1');
Retrying and rollback with TxId is no longer necessary, as the sync engine now handles rollbacks with a new API. See below for more details.

Sync error handling methods changed
The TriplitClient methods retry, rollback, onTxSuccessRemote, and onTxFailureRemote have been replaced with a new API for handling sync errors. The new methods include onFailureToSyncWrites, onEntitySyncError, onEntitySyncSuccess, clearPendingChangesForEntity and clearPendingChangesForAll. Instead of registering callbacks for a specific transaction, you may register callbacks for a specific entity.

It is important that you handle sync errors in your app code, as the sync engine can get blocked if the entity that causes the error is not removed from the outbox or updated.

Before:

import { triplit } from './client';
 
const { txId } = await triplit.insert('todos', { id: '1', text: 'Buy milk' });
 
triplit.onTxSuccessRemote(txId, () => {
  console.log('Transaction succeeded');
});
 
triplit.onTxFailureRemote(txId, () => {
  console.log('Transaction failed');
  triplit.rollback(txId);
});
After:

import { triplit } from './client';
 
const insertedEntity = await triplit.insert('todos', {
  id: '1',
  text: 'Buy milk',
});
 
triplit.onEntitySyncSuccess('todos', '1', () => {
  console.log('Entity synced');
});
 
// if you need to full rollback
triplit.onEntitySyncError('todos', '1', () => {
  triplit.clearPendingChangesForEntity('todos', '1');
});
 
// if you can handle the error and want to try with a changed entity
// mutating the entity will trigger a new sync
triplit.onEntitySyncError('todos', '1', () => {
  triplit.update('todos', '1', (e) => {
    e.text = 'Buy buttermilk';
  });
});
 
// if you want to listen to any failed write over sync
triplit.onFailureToSyncWrites((error, writes) => {
  console.error('Failed to sync writes', error, writes);
  await triplit.clearPendingChangesAll();
});
getSchemaJSON removed
The getSchemaJSON method has been removed from the TriplitClient API, as the schema is now JSON by default.

Before:

import { triplit } from './client';
 
const serializedSchema = await triplit.getSchemaJSON();
After:

import { schema } from './schema';
const serializedSchema = await triplit.getSchema();
Frameworks
Angular
Triplit previously maintained two sets of Angular bindings: the signal-based injectQuery and the observable-based createQuery. In Triplit 1.0, we've removed the signal-based bindings in favor of the more flexible and powerful observable-based bindings. If you're using the signal-based bindings, you'll need to update your app to use the observable-based bindings. Generally this means adopting the Async pipe syntax in your templates or by using the @angular/rxjs-interop package to translate them to signals.

Expo / React Native
Expo SQLite storage provider
There's a new storage provider for Expo applications that use the expo-sqlite package. You can now use the ExpoSQLiteKVStore storage provider to store data on the device. This provider is available in the @triplit/client package.

import { ExpoSQLiteKVStore } from '@triplit/client/storage/expo-sqlite';
import { TriplitClient } from '@triplit/client';
 
new TriplitClient({
  storage: new ExpoSQLiteKVStore('triplit.db'),
});
You should use a new name for your SQLite database to avoid conflicts with any legacy Triplit databases on the device.

@triplit/react-native
We moved relevant React Native code to a new @triplit/react-native package. This includes various helpers for configuring your app with Expo and Triplit and re-exports the same hooks available in the @triplit/react package. You can find updating information on setting up a react project with Triplit here.

HTTP API
If you're using the HttpClient to interact with the HTTP API, you won't need to make any changes to your code. If you're interacting with the API directly (e.g. with a raw fetch call):

The /fetch route now returns an flatter JSON payload of query results (Entity[]), rather than a JSON object of the shape{ result : [string, Entity][] }.
So for this query:

const response = await fetch('https://<project-id>.triplit.io/fetch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    collection: 'todos',
    query: {
      collectionName: 'todos',
      where: [['completed', '=', false]],
    },
  }),
});
Before:

const result = await response.json();
// result = { result: [['123',{ id: '123', title: 'Buy milk', completed: false }]] }
After:

const result = await response.json();
// result = [{ id: '123', title: 'Buy milk', completed: false }]
While the query builder methods (.e.g Where, Order, Include) have changed capitalization, keys in a json query payload remain lowercase.

Migrating your server
Self hosted
If you're self hosting, you'll need to migrate your own database. Triplit provides a few tools that are helpful for this process, but it is up to you to ensure you safely migrate the database for your application's needs.

If you are using SQLite for storage (which is the default) and you are re-using the same machine, it is recommended that you delete your existing database file(s) during the migration. These files should exist at the path you have specified by your LOCAL_DATABASE_URL variable. This isn't strictly necessary, but highly recommended as it will improve the performance of the database and ensures no data from V0 is carried over.

There are a variety of ways you could go about migrating data from V0 to V1, but generally the steps to migrate your server are:

If you have outside traffic to your server and want to re-use your machine, we recommend that you disable that traffic during the migration. For example, if you are directly serving a docker container you can change the port that the container is exposed on. Alternatively, you could deploy to a different machine that won't have outside traffic.
Take a snapshot of your database with triplit snapshot create.
If you are re-using your machine, delete your existing database file(s).
Pointing to the server you would like to push to, run triplit snapshot push --snapshot=<snapshotId>.
With an updated schema as described above, run triplit schema push.
Congratulations, you have successfully migrated your server from V0 to V1! If things seem stable, you may now re-enable traffic to your server. If anything seems incorrect, you should have your data saved in a snapshot.
If you would like any help or have any questions, please reach out to us in the Triplit Discord or at help@triplit.dev.

Triplit Cloud
If you're on a Triplit Cloud database, you don't need to do anything to upgrade your server. We'll handle the upgrade for you when you're ready to upgrade. Just contact us in the Triplit Discord or at help@triplit.dev.

Build a Todos app with React, Vite and Triplit
This tutorial will show you how to build a simple Todos app with React, Vite and Triplit. It will cover the following topics:

How to create a new Triplit project
How to create a new React app with Vite
How to create a Triplit schema for the Todos app
How to use the Triplit console
How to read and mutate data with Triplit
How to sync data with Triplit
The app will be built with:

React as the UI framework
Vite as the build tool
Triplit as the database and sync engine
If at any time you want to check your progress against the finished app, or if you get stuck, you can find the source code for the finished app here.

Project setup
Create a new project
Let's use Vite to create a new React app. Run the following command in your terminal:

npm create vite@latest todos -- --template react-ts

Follow the prompts to create a new project. Once it's been created, navigate to the project directory:

cd todos

Add in Triplit
Before we start building the app, we need to integrate Triplit and its dependencies project. You can do this by installing the Triplit CLI, the React bindings, and running the init command.

npm install -D @triplit/cli
npx triplit init --framework react

This will will create some Triplit-specific files and add the necessary dependencies.

The directory structure for your new project should look like this:

/triplit
  schema.ts
/public
  [static files]
/src
  [app files]
[other files]
Define the database schema
Triplit uses a schema to define the structure of your data. By using a schema, Triplit can validate your data at runtime and provide autocompletion in your editor.

We're going to set up a schema for the Todos app in the ./triplit/schema.ts file. Open the file and replace its contents with the following code:

./triplit/schema.ts
import { Schema as S } from '@triplit/client';
 
export const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean({ default: false }),
      created_at: S.Date({ default: S.Default.now() }),
    }),
  },
});

This schema defines a single collection, todos, with the following fields:

id: A unique identifier for the todo. Every Triplit collection must have an id field. Defaults to a random string if not specified.
text: A string that contains the todo text.
completed: A boolean value that indicates whether the todo is completed or not. Defaults to false if not specified.
created_at: A timestamp that indicates when the todo was created. Defaults to the current time if not specified.
Start the development server
Triplit provides a development server that you can use to test your app locally. To start the development server, run the following command:

npx triplit dev

This will start the sync server at http://localhost:6543 and a database console at https://console.triplit.dev/local. It will also output API tokens that your app will use to connect to the sync server.

Now's a good time to set up an .env file in the todos directory. This file will contain the API tokens that your app will use to connect to the sync server. Create a new file called .env in the todos directory and add the following:

.env
TRIPLIT_DB_URL=http://localhost:6543
TRIPLIT_SERVICE_TOKEN=replace_me
TRIPLIT_ANON_TOKEN=replace_me
# Replace `replace_me` with the tokens in the terminal where you ran `npx triplit dev`
 
VITE_TRIPLIT_SERVER_URL=$TRIPLIT_DB_URL
VITE_TRIPLIT_TOKEN=$TRIPLIT_ANON_TOKEN

Make sure you have .env as part of your .gitignore file:

.gitignore
# Ignore .env files
.env

Now restart the development server by pressing Ctrl + C and running npx triplit dev again.

We're basically done setting up Triplit. Now we can start building the app.

The development server automatically loads your schema on startup. If you're not running a local server, run npx triplit schema push to make the remote server aware of the schema you've defined.

Building the app
Let's start building the app.

Getting started with Vite
Vite is a build tool that makes building apps fast and easy. We already installed Vite above, so let's start using it.

In a new terminal, in the todos directory, run the following command to start the Vite development server:

npm run dev

This will start the Vite development server on port 5173. You can now open your browser and navigate to http://localhost:5173 to see the app.

The Triplit client
Now that we have the development server running, let's integrate Triplit into our client code.

Triplit provides a client library that you can use to read and write data. Let's initialize it with our API tokens and the schema that we defined earlier. Create a new file in the triplit directory called client.ts and add the following code:

triplit/client.ts
import { TriplitClient } from '@triplit/client';
import { schema } from './schema';
 
export const triplit = new TriplitClient({
  schema,
  serverUrl: import.meta.env.VITE_TRIPLIT_SERVER_URL,
  token: import.meta.env.VITE_TRIPLIT_TOKEN,
});

Any time you want to read or write data, you'll import the triplit object from this file.

Optional: styling
The Vite app template comes with some basic styles. Feel free to replace them with your own styles or some of ours. Replace the contents of index.css with the following:

src/index.css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
 
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
 
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
 
.app {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  gap: 16px;
}
 
.todo {
  display: flex;
  gap: 1em;
  align-items: center;
  margin-bottom: 8px;
}
 
.btn {
  margin-left: 8px;
  border: none;
  border-radius: 0.25em;
  padding: 0.5em 1em;
  background-color: cornflowerblue;
  color: #fff;
  font-size: 1em;
  cursor: pointer;
}
 
.todo-input {
  border-radius: 0.25em;
  border-color: cornflowerblue;
  padding: 0.5em 1em;
  background-color: #242424;
  color: #fff;
  font-size: 1em;
}
 
.x-button {
  border: none;
  background-color: transparent;
  display: none;
}
.x-button:hover {
  filter: brightness(1.5);
}
 
.todo:hover .x-button {
  display: block;
}

Creating todos
The Vite app template comes with an App.tsx file that contains some components. Let's replace it with an <form/> component that creates a new todo.

Replace the contents of App.tsx with the following:

src/App.tsx
import React, { useState } from 'react';
import { triplit } from '../triplit/client';
 
export default function App() {
  const [text, setText] = useState('');
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await triplit.insert('todos', { text });
    setText('');
  };
 
  return (
    <div className="app">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What needs to be done?"
          className="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit" disabled={!text}>
          Add Todo
        </button>
      </form>
    </div>
  );
}

This component renders a form with a text input and a submit button. When the form is submitted, it calls triplit.insert to create a new todo. It uses React to update the text input's value and clear it when the form is submitted.

Notice that in the call to triplit.insert, we're omitting several of the fields we defined in our schema. That's because those missing fields, id, completed, and created_at, have default values. Triplit will automatically fill in those fields with their default values.

The Triplit console
We have a component that creates a new todo, but we still need to write some code that fetches the todos from the database and renders them on the page. If we want to test that our insertions are working without doing any more work, we can use the Triplit console.

When you ran npx triplit dev earlier, it started a Triplit console. This is located at https://console.triplit.dev/local. You should see a page that looks like this:

Triplit console

The console allows you to view and edit the contents of your database. You can use it to view the todos that you've created so far. You can also use it to create new todos or update existing ones. Add some todos from your Vite app, and watch them appear in the todos collection in the console. Then, in the console, click on a cell in the new rows that appear and update it.

The Triplit console is super powerful. Not only can you mutate data, but you can apply filters, sorts, navigate relations and more.

Creating a todo component
Now that we have a way to create a new todo, let's create a component that renders a todo.

Create a new components directory inside the src directory and a file called Todo.tsx and add the following code:

src/components/Todo.tsx
import { Entity } from '@triplit/client';
import { schema } from '../../triplit/schema';
import { triplit } from '../../triplit/client';
 
type Todo = Entity<typeof schema, 'todos'>;
 
export default function Todo({ todo }: { todo: Todo }) {
  return (
    <div className="todo">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() =>
          triplit.update('todos', todo.id, async (entity) => {
            entity.completed = !todo.completed;
          })
        }
      />
      {todo.text}
      <button
        className="x-button"
        onClick={() => {
          triplit.delete('todos', todo.id);
        }}
      >
        ❌
      </button>
    </div>
  );
}

In this component, we're rendering a checkbox and some text describing our todo. The Todo component takes a single prop, a Todo entity, and renders it. To get the Todo type from our schema we use the Entity generic type, and pass in our schema and the name of the collection ('todos') that we want a type for.

When the checkbox is clicked, we call triplit.update to update the todo's completed field. triplit.update takes three arguments: the name of the collection, the id of the entity to update, and a callback that updates the entity.

When the ❌ button is clicked, we call triplit.delete to delete the todo. triplit.delete takes two arguments: the name of the collection and the id of the entity to delete.

Rendering the todos
Now that we have a component that renders a todo, let's render a list of todos.

First, let's query the todos from the database. We're going to use the useQuery hook provided by Triplit to query the todos and store them as React state. At the top of App.tsx, add the following code:

src/App.tsx
import React, { useState } from 'react';
import { triplit } from '../triplit/client';
import { useQuery } from '@triplit/react';
 
function useTodos() {
  const todosQuery = triplit.query('todos').Order('created_at', 'DESC');
  const { results: todos, error } = useQuery(triplit, todosQuery);
  return { todos, error };
}
 
export default function App() {
  const [text, setText] = useState('');
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await triplit.insert('todos', { text });
    setText('');
  };
 
  return (
    <div className="app">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What needs to be done?"
          className="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit" disabled={!text}>
          Add Todo
        </button>
      </form>
    </div>
  );
}

The useQuery hook takes two arguments: a Triplit client and a query. The query is created by calling triplit.query and passing in the name of the collection that we want to query. useQuery returns an object with the following properties:

results: An Array<Todo> that contains the results of the query.
error: An error object if the query failed, or undefined if the query succeeded.
fetching: A boolean that indicates whether the query is currently fetching data.
One thing to notice is that we've added an order clause to the query. This will order the todos by their created_at field in descending order. This means that the most recently created todos will be at the top of the list. Triplit's query API supports a wide range of clauses, including where, limit, offset, order, and more. You can learn more about the query API here.

Now we're going to render the todos in the App component. Add the following lines to the App component:

src/App.tsx
import React, { useState } from 'react';
import { useQuery } from '@triplit/react';
import { triplit } from '../triplit/client';
import Todo from './components/Todo';
 
function useTodos() {
  const todosQuery = triplit.query('todos').Order('created_at', 'DESC');
  const { results: todos, error, fetching } = useQuery(triplit, todosQuery);
  return { todos, error, fetching };
}
 
export default function App() {
  const [text, setText] = useState('');
  const { todos } = useTodos();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await triplit.insert('todos', { text });
    setText('');
  };
 
  return (
    <div className="app">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="What needs to be done?"
          className="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit" disabled={!text}>
          Add Todo
        </button>
      </form>
      <div>{todos?.map((todo) => <Todo key={todo.id} todo={todo} />)}</div>
    </div>
  );
}

Here we've:

Imported our <Todo/> component
Called the useTodos hook to query the todos
Rendered the todos by iterating over the array with Array.map in our <App/> component.
Triplit queries are live, meaning that you never need to manually refetch data. As other clients insert, update or delete data, your query will automatically update to reflect those changes. Even if you go offline, the query will listen for the changes that you make locally and update the query with those local changes. When you go back online, the Triplit will sync those local changes with the server and pull in any changes it missed while we were offline.

Persisting data
So far, Triplit has been storing data in-memory (the default for TriplitClient). That means that if you refresh the page and go offline, you'll lose your data. Triplit supports a variety of storage options that you can use to persist your data even between refreshes or if you go offline.

IndexedDB is a low level durable storage API built into all modern browsers. Update the client.ts file to use the indexeddb storage option:

triplit/client.ts
import { schema } from './schema.js';
 
export const triplit = new TriplitClient({
  storage: 'indexeddb',
  schema,
  serverUrl: import.meta.env.VITE_TRIPLIT_SERVER_URL,
  token: import.meta.env.VITE_TRIPLIT_TOKEN,
});

When you use the Triplit client to insert or update data, that data will persist to IndexedDB. Test it out: if you create a few todos and refresh your browser, you should see that your todos are still there.

Testing out the sync
Now that we have a working app, let's test out the sync. In one browser window, navigate to http://localhost:5173. Then, open a private browsing window and navigate to http://localhost:5173. You should see the same app in both tabs. Now, create a new todo in one tab. You should see the todo appear in the other tab. Try checking and unchecking the todo. You should see the changes reflected in the other tab. Triplit works offline as well - try disconnecting from the internet and creating a new todo in one of the windows. You should see the todo appear in the other tab when you reconnect. This is the power of syncing with Triplit!

Next steps
We've built a simple Todos app with React, Vite and Triplit. We've learned how to:

Create a new Triplit project
Create a new React app with Vite
Create a Triplit schema for the Todos app
Read and mutate data with Triplit
Sync data with Triplit
And there are still a lot of things that we haven't covered.

The rest of Triplit's query API to select, filter and paginate data
Triplit's access control rules to control who can read and write data
Triplit's transaction API
Triplit's relational API to establish relationships between collections and then select data across those relationships
The various storage options for your Triplit client's cache
How to self-host Triplit


Frequently asked questions
Why should I choose Triplit over a traditional database?
Triplit is designed to have the best developer experience possible right out of the box. It was created to make building apps with real-time, local-first user experiences much easier than with existing tools. So if you aspire to have your app to feel native while supporting collaborative features expected of modern web apps, then Triplit is probably the right choice for you.

Why should I care about offline support?
By adding offline support to your app, you end up making it fast in all network conditions. Even if your users are on fast internet and you've fully optimized your server, you can't beat the speed of light. Having a robust cache on device will just improve your user experience by making each interaction feel instant and not delayed by a roundtrip to the server. This is same strategy employed by some of the most loved apps like Linear, Figma, and Superhuman.

How can Triplit be a relational database if it doesn't use joins?
In Triplit, relationships are simply sub-queries. They allow you to connect entities across collections (or even within the same collection) with the expressiveness of a query. Triplit's support for set attributes allows it to establish complex relations without join tables. Sets can be used to "embed" the related ids directly on the entity. For example, a schema for a chat app with users and messages could be defined as follows:

const schema = S.Collections({
  users: {
    schema: S.Schema({
      id: S.String(),
      name: S.String(),
    }),
  },
  messages: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      likes: S.Set(S.String()),
    }),
    relationships: {
      users_who_liked: S.RelationMany({
        collectionName: 'users',
        where: [['id', 'in', '$likes']],
      }),
    },
  },
});
Check out relations in your schema to learn more.

How does Triplit handle multiple writers / collaboration / multiplayer?
Every entity inserted into Triplit is broken down at the attribute level, and each attribute is assigned a unique timestamp. This means when multiple users change different attributes of the same entity, they don't conflict or collide. When two users do update the same attribute at the same time, we use these timestamps to decide which value will be kept. In the literature this type of data structure is called a CRDT or more specifically a Last Writer Wins Register that uses Lamport timestamps.

A CRDT is a Conflict-Free Replicated Data Type. It's a name for a family of data structures that can handle updates from multiple independent writers and converge to a consistent, usable state.

Does Triplit support partial replication?
Yes. We believe that partial replication is the only practical way to make applications fast over the network. When Triplit clients subscribe to specific queries the Triplit servers only send data to the clients that are listening for it and that have not yet received it. Triplit's sync protocol sends only 'deltas' between the client and server to minimize latency and network traffic.

How do I connect to Triplit from a server?
You can use the HTTP Client to query and update data from a server, serverless function, command line interface, or anywhere that supports HTTP. You can also interface with the HTTP REST endpoints directly.

Why does Triplit support sets but not arrays?
Every data structure that Triplit can store is designed to support multiple concurrent writers. Sets are able to handle concurrent additions and removals without problem, but arrays lose many nice properties under collaboration. Consider the push method: if two people concurrently push to an array they will end up adding an element to the same index, ultimately causing one item to overwrite the other. In the future, Triplit will expose a List datatype that will support pushing to the beginning and end of a list and assignment operations to specific indices. In most cases using a Set or a List in place of an Array will suffice.

Why do ordinary databases struggle with collaborative applications?
Many popular databases do not implement real-time query subscriptions, which are the foundation for collaborative apps. Developers generally end up replicating the functionality of their remote database on the client to create the illusion of live updating queries.

Last

triplit schema
Read our guide on how to update a schema for more information.

triplit schema push
triplit schema push
Apply the local schema to the server
Flags:
--enforceBackwardsCompatibility, -e Enforce backwards compatibility, fail if there are any backwards incompatible changes
    Default: false
--printIssues, -p Print issues even if successful
    Default: false
--token, -t Service Token
--remote, -r Remote URL to connect to
--schemaPath File path to the local schema file
--requireSchema Throw an error if no local schema file is found
    Default: false
triplit schema print
triplit schema print
View the schema of the current project
Flags:
--location, -l Location of the schema file
    Options: local, remote (default: remote)
--format, -f Format of the output
    Options: json, typescript, json-schema (default: typescript)
--token, -t Service Token
--remote, -r Remote URL to connect to
--schemaPath, -P File path to the local schema file
--noSchema, -N Do not load a schema file
triplit schema diff
triplit schema diff
Show the diff between local and remote schema
Flags:
--token, -t Service Token
--remote, -r Remote URL to connect to
--schemaPath, -P File path to the local schema file
--noSchema, -N Do not load a schema file
Last

triplit seed
Read our guide on how to seed data for more information.

triplit seed create
triplit seed create
Creates a new seed file
Arguments:
0: filename Name for your seed file
Flags:
--schemaPath, -P File path to the local schema file
--noSchema, -N Do not load a schema file
triplit seed run
triplit seed run
Seeds a Triplit project with data
Arguments:
0: file Run a specific seed file
Flags:
--all, -a Run all seed files in /triplit/seeds
--token, -t Service Token
--remote, -r Remote URL to connect to
--schemaPath, -P File path to the local schema file
--noSchema, -N Do not load a schema file
Last

triplit snapshot
triplit snapshot create
triplit snapshot create
Exports all database information to files.
Flags:
--outDir The directory to save the snapshot to.
--token, -t Service Token
--remote, -r Remote URL to connect to
triplit snapshot push
triplit snapshot push
Pushes a snapshot to the server.
Flags:
--snapshot The directory containing the source snapshot.
--token, -t Service Token
--remote, -r Remote URL to connect to
--ignoreDestructiveWarning Ignore warning that command may be destructive
    Default: false
Last
triplit clear
triplit clear
Clears the sync server's database
Flags:
--full, -f Will also clear all metadata from the database, including the schema.
--token, -t Service Token
--remote, -r Remote URL to connect to
Last

triplit roles
triplit roles eval
triplit roles eval
See what roles the given token is allowed to assume
Arguments:
0: token A JWT token or a JSON-parseable string of claims
Flags:
--location, -l Location of the schema file
    Options: local, remote
--token, -t Service Token
--remote, -r Remote URL to connect to
--schemaPath, -P File path to the local schema file
--noSchema, -N Do not load a schema file
Last

triplit init
triplit init
Initialize a Triplit project
Flags:
--framework, -f Frontend framework helpers to install
    Options: react, svelte, vue, angular
--template, -t Project template to use
    Options: chat
Last
triplit repl
triplit repl
Start a REPL with the Triplit client
Flags:
--token, -t Service Token
--remote, -r Remote URL to connect to
--schemaPath, -P File path to the local schema file
--noSchema, -N Do not load a schema file
Last

React
New projects
The fast way to get started with Triplit is to use Create Triplit App which will scaffold a React application with Triplit. Choose React when prompted for the frontend framework.

npm create triplit-app@latest my-app

Existing projects
If you have an existing React project, you can install the hooks provided by @triplit/react:

npm i @triplit/react

useQuery
The useQuery hook subscribes to the provided query inside your React component and will automatically unsubscribe from the query when the component unmounts.

The result of the hook is an object with the following properties:

results: An array of entities that satisfy the query.
fetching: A boolean that will be true initially, and then turn false when either the local fetch returns cached results or if there were no cached results and the remote fetch has completed.
fetchingLocal: A boolean indicating whether the query is currently fetching from the local cache.
fetchingRemote: A boolean indicating whether the query is currently fetching from the server.
error: An error object if the query failed to fetch.
app.tsx
import { useQuery } from '@triplit/react';
 
const client = new TriplitClient();
const query = client.query('todos');
 
function App() {
  const { results, fetching, error } = useQuery(client, query);
 
  if (fetching) return <div>Loading...</div>;
  if (error) return <div>Could not load data.</div>;
 
  return <div>{results?.map((item) => <div>{item.text}</div>)}</div>;
}
If you're looking for the most multi-purpose loading state, fetching is the one to use. If you want to ensure that you're only showing the most up-to-date data from the server, you can use fetchingRemote. If your app is offline and should only wait for the cache, use fetchingLocal.

useQueryOne
The useQueryOne hook subscribes to a single entity that matches the provided query. You can use this hook inside your React component and it will automatically unsubscribe from updates to the entity when the component unmounts.

The result of the hook is the same as the result of useQuery, but the result property will only have a single the entity or null.

app.tsx
import { useQueryOne } from '@triplit/react';
 
const client = new TriplitClient();
 
function App() {
  const { result: todo } = useQueryOne(
    client,
    client.query('todos').Id('todo-id')
  );
 
  return <div>{todo.text}</div>;
}

usePaginatedQuery
The usePaginatedQuery hook subscribes to the provided query, and exposes helper functions to load the next or previous page of results. It is useful for patterns that load data in pages, such as paginated lists or content browsing applications.

app.tsx
import { usePaginatedQuery } from '@triplit/react';
 
const client = new TriplitClient();
 
function App() {
  const {
    results,
    fetchingPage,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    prevPage,
  } = usePaginatedQuery(
    client,
    client.query('todos').Limit(10).Order('created_at', 'DESC')
  );
 
  return (
    <div>
      {results?.map((item) => <div>{item.text}</div>)}
      {fetchingPage && <div>Loading page...</div>}
      {hasPreviousPage && <button onClick={prevPage}>Previous page</button>}
      {hasNextPage && <button onClick={nextPage}>Next page</button>}
    </div>
  );
}

For usePaginatedQuery to function properly the provided query must have a limit set.

useInfiniteQuery
The useInfiniteQuery hook subscribes to the provided query, and exposes helper functions for loading more results. It is useful for patterns that continuously load more data in addition to the existing result set. Chat applications or content browsing applications that load more data as the user scrolls are good use cases for useInfiniteQuery.

app.tsx
import { useInfiniteQuery } from '@triplit/react';
 
const client = new TriplitClient();
 
function App() {
  const { results, fetchingMore, hasMore, loadMore } = useInfiniteQuery(
    client,
    client.query('todos').Limit(10).Order('created_at', 'DESC')
  );
 
  return (
    <div>
      {results?.map((item) => <div>{item.text}</div>)}
      {fetchingMore && <div>Loading more...</div>}
      {hasMore && <button onClick={loadMore}>Load more</button>}
    </div>
  );
}

For useInfiniteQuery to function properly the provided query must have a limit set. By default loadMore will increase the limit by the initial limit set in the query. You can also provide a argument to loadMore denoting if you want to increment the limit by a different amount.

useConnectionStatus
The useConnectionStatus hook subscribes to changes to the connection status of the client and will automatically unsubscribe when the component unmounts.

app.tsx
import { useConnectionStatus } from '@triplit/react';
 
const client = new TriplitClient();
 
function App() {
  const connectionStatus = useConnectionStatus(client);
 
  return (
    <div>
      The client is {connectionStatus === 'OPEN' ? 'connected' : 'disconnected'}
    </div>
  );
}

Last

React Native
React Native is the best way to run Triplit on a mobile app. The hooks available in the React package are also available in React Native.

Expo
If you are using Expo to setup your React Native project, you can follow these steps to get Triplit up and running.

Create an Expo project and install Triplit
Create your expo project:

npx create-expo-app -t expo-template-blank-typescript
 
cd my-app
For more information on setting up an Expo project with typescript see the Expo documentation.

Next, install Triplit's packages:

There is currently a bug in how Triplit handles optional dependencies in Metro, so you will need to install uuidv7 as a dependency in your project. This is a temporary workaround until the bug is fixed.

npm i @triplit/client @triplit/react-native uuidv7
npm i @triplit/cli --save-dev

Configure polyfills
Triplit was originally built to run in web browsers, so a few APIs are used in some core packages and dependencies that are not in the ECMAScript spec that Hermes implements. So you will need to add some polyfills to your project.

These polyfills should be imported or implemented in your project's entry file so they can be run as early as possible. Typically this is your index.js file. If you are using Expo Router see this thread on creating and using an index.js file to add polyfills.

// Import polyfills relevant to Triplit
import '@triplit/react-native/polyfills';
// ... other polyfills
 
// If using Expo Router:
import 'expo-router/entry';
 
// The rest of your entry file
Use React hooks
Triplit's React hooks are also exported via @triplit/react-native, so you can use them in your components just like you would in a web app.

import { useQuery } from '@triplit/react-native';
 
const { results } = useQuery(client, client.query('todos'));
Additional configuration
Update metro.config.js (metro < 0.82.0)
If you are using a Metro version before 0.82.0, you will need to add a custom Metro config to your project. This is encompasses most users using Expo 52 and below. This is because Triplit uses some features that are not supported by the Metro bundler, notably the exports field.

To determine the version of Metro that is installed, run the following command:

npm list metro

Below is an example output with version 0.82.3 installed:

$ npm list metro
my-app@0.0.1 /path/to/my-app
└─┬ react-native@0.79.2
  └─┬ @react-native/community-cli-plugin@0.79.2
    ├─┬ metro-config@0.82.3
    │ └── metro@0.82.3 deduped
    └─┬ metro@0.82.3
      └─┬ metro-transform-worker@0.82.3
        └── metro@0.82.3 deduped
If you are using a version prior to 0.82.0, Triplit provides a utility for generating a custom Metro config that will resolve these exports. If you have not already created a metro.config.js file, please see the Expo docs on properly configuring Metro. Once you have created a metro.config.js file, you can add the following code to properly resolve Triplit packages:

const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
const { triplitMetroConfig } = require('@triplit/react-native/metro-config');
 
module.exports = triplitMetroConfig(config);
If you would like more control over dependency resolution, you can import triplitMetroResolveRequest and use it inside a custom resolver.

const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
const {
  triplitMetroResolveRequest,
} = require('@triplit/react-native/metro-config');
 
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const triplitResult = triplitMetroResolveRequest(moduleName);
  if (triplitResult) return triplitResult;
 
  // Additional resolver logic
 
  return context.resolveRequest(context, moduleName, platform);
};
 
module.exports = config;
Configure Babel (web only)
If you are building for the web, you'll need to update a babel configuration file. At the root of your Expo project, create a babel.config.js file with the following content:

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    assumptions: {
      enumerableModuleMeta: true,
    },
  };
};
Configure a development build
If you are using Expo Go, you can skip this step. However, if you are building a custom development build of your app, you will also need to perform the following steps to ensure Triplit works correctly:

Install expo-crypto
npx expo install expo-crypto
Local development
When running a local development server on your machine, it will be running at localhost. However if you are running your app on a physical device (ie your phone with the Expo Go app or a custom build) you will need to change the localhost to your machine's IP address. You can find your IP address by running ipconfig getifaddr en0 in your terminal. So a URL http://localhost:<port> would become http://<your-ip>:<port>.

Storage providers
Triplit provides storage providers for React Native applications to persist data on the device, including for expo-sqlite. Read more about the available storage providers in the client storage documentation.

Bare React Native
The team over at Triplit hasn't had the chance to test out a bare React Native project. Although we don't expect the required steps to be much different than with Expo, there may be differences. If you have set up Triplit in a bare RN project, please let us know how it went!

Last

Triplit in the browser
Triplit is the embedded database designed to run in any JavaScript environment, including the browser. Almost every developer will use Triplit in the browser through the TriplitClient client library. Read more about the TriplitClient in the client library documentation.

Supported storage options
Memory
The memory storage option is the default storage option for the TriplitClient. It stores all data in memory and is not persistent. This means that all data will be lost when the page is refreshed or closed.

IndexedDB
To persist data in the browser, you can use the indexeddb storage option in the TriplitClient. This will store all data in the browser's IndexedDB database. By default, the TriplitClient will cache all data in memory for fast access. If you want to disable this, you can set the cache option to false when creating the TriplitClient. Read more about IndexedDB storage configuration in the client library documentation.

Example
import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  storage: 'indexeddb',
  token: '<your token>',
  serverUrl: 'https://<project-id>.triplit.io',
});
Last
Hermes (React Native)
Triplit's client library can be used in React Native applications built on the Hermes runtime.

Supported storage options
Memory
The memory storage option is the default storage option for the TriplitClient. It stores all data in memory and is not persistent. This means that all data will be lost when the page is refreshed or closed.

Expo SQLite
Triplit provides an expo-sqlite storage adapter for React Native applications built with Expo. This adapter uses the expo-sqlite package to store data on the device. Read Triplit's expo-sqlite storage provider documentation for more information.

Example
import { ExpoSQLiteKVStore } from '@triplit/client/storage/expo-sqlite';
import { TriplitClient } from '@triplit/client';
 
new TriplitClient({
  storage: new ExpoSQLiteKVStore('triplit.db'),
  serverUrl: process.env.EXPO_PUBLIC_SERVER_URL,
  token: process.env.EXPO_PUBLIC_TOKEN,
});
LastSchemas
Schemaful vs Schemaless
Providing a schema to Triplit is optional, but it is recommended in order to take advantage of all the features provided by Triplit.

Limitations of schemaless mode include:

You are limited to exclusively using storing value types that are supported by JSON: string, number, boolean, objects, null.
If you use Typescript, you will not get type checking for your queries and results.
Access control rules are defined in schemas, and thus are not supported in schemaless mode.
Defining your schema
A schema object defines your collections and the attributes and relationships on those collections. Schemas are defined in Javascript like so:

import { Schema as S, TriplitClient } from '@triplit/client';
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      complete: S.Boolean(),
      created_at: S.Date(),
      tags: S.Set(S.String()),
    }),
  },
  users: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
      address: S.Record({
        street: S.String(),
        city: S.String(),
        state: S.String(),
        zip: S.String(),
      }),
    }),
  },
});
 
const client = new TriplitClient({
  schema,
});
Passing a schema to the client constructor will override any schema currently stored in your cache. This can cause data corruption if the new schema is not compatible with existing data in the shape of the old schema. Refer to the schema management guide for more information.

By default, your schema file will be created by triplit init or npm create triplit-app in your project directory at triplit/schema.ts. If you need to save your schema file somewhere else, you can specify that path with the TRIPLIT_SCHEMA_PATH environmental variable and the Triplit CLI commands will refer to it there.

id
Every collection in Triplit must define an id field in its schema. The S.Id() data type will generate a random id by default upon insertion. You can specify the format of the generated ID using the format option.

ID Generation Formats
Triplit supports three ID generation formats:

nanoid (default): Generates a 21-character URL-safe ID. Pre-installed on both client and server.
uuidv4: Generates a standard UUID v4. Uses native functionality, no package required.
uuidv7: Generates a UUID v7 with timestamp ordering. Requires the uuidv7 package on the client (pre-installed on server).
// Using different ID formats
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id({ format: 'nanoid' }), // default
      // ... other fields
    }),
  },
  users: {
    schema: S.Schema({
      id: S.Id({ format: 'uuidv4' }),
      // ... other fields
    }),
  },
  posts: {
    schema: S.Schema({
      id: S.Id({ format: 'uuidv7' }),
      // ... other fields
    }),
  },
});
If you want to specify the id for each entity, you may pass it as a string in to the insert method as shown below.

// assigning the id automatically
await client.insert('todos', {
  text: 'get tortillas',
  complete: false,
  created_at: new Date(),
  tags: new Set(['groceries']),
})
 
// assigning the id manually
await client.insert('todos', {
  id: 'tortillas'
  text: 'get tortillas',
  complete: false,
  created_at: new Date(),
  tags: new Set(['groceries']),
})
For uuidv7 format, you need to install the uuidv7 package on the client: bash npm install uuidv7 The server has this package pre-installed.

Getting types from your schema
While the schema passed to the client constructor will be used to validate your queries and give you type hinting in any of the client's methods, you may want to extract the types from your schema to use in other parts of your application.

Entity
You can extract a simple type from your schema with the Entity type.

import { type Entity, Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      complete: S.Boolean(),
      created_at: S.Date(),
      tags: S.Set(S.String()),
    }),
  },
});
 
type Todo = Entity<typeof schema, 'todos'>;
/* 
Todo will be a simple type:
{ 
  id: string, 
  text: string, 
  complete: boolean, 
  created_at: Date, 
  tags: Set<string> 
} 
*/
QueryResult
If you need more advanced types, e.g. that include an entity's relationships, you can use the QueryResult type. It allows you to generate the return type of any query, e.g. with a Select clause that narrows fields or Include clauses that add related entities.

import { type QueryResult, Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  users: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
    }),
    relationships: {
      posts: S.RelationMany('posts', {
        where: [['authorId', '=', '$1.id']],
      }),
    },
  },
  posts: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
  },
});
 
type UserWithPosts = QueryResult<
  typeof schema,
  { collectionName: 'users'; select: ['name']; include: { posts: true } }
>;
 
/*
type UserWithPosts = {
  name: string;
  posts: Array<{
    id: string;
    text: string;
  }>
}
*/
Reading your schema
Your schema is available in your codebase in the triplit/schema.ts file. However you may locally edit the schema, or you may not be aware of remote edits that have happened to the schema. To view the current state of the server's schema, run:

triplit schema print -l remote -f file
See CLI docs or run triplit schema print --help for more options.

LastUpdating your schema
Introduction
Triplit provides tools that help you update your schema in a way that will:

allow clients with the previous version of the schema to continue syncing and
maintain the integrity of data in their caches and on the server
With these goals in mind, Triplit divides schema changes into two categories:

Backwards compatible changes
These are changes that you can make to your schema that will never corrupt existing data in the database or cause issues with clients that have a local cache. These changes are:

Adding optional attributes
Adding new collections
Triplit will allow you to make these changes to your schema while the server is running, and you can push them to the server using the triplit schema push command.

Backwards incompatible changes
Any other change to the schema is considered backwards incompatible. These include:

removing an attribute
adding a required attribute
changing the type of an attribute
These are "backwards incompatible" because even though they may be changed safely on the server, your app may have online client with cached data or offline clients with durable caches that violate the new schema.

This does not mean that you can't make these changes, but it does mean that you will need to account for the fact that clients may have data in their local cache that doesn't match the schema. This may necessitate updating your client code to:

loosen the assumptions about schema in the client code, e.g. handling attributes that have been removed or changed.
run a script on app load that migrates database to match the new schema.
clear the local cache on app load.
None of these are ideal solutions, which is why making backwards incompatible changes to the schema is discouraged. However, Triplit will allow you to make backwards incompatible changes to the schema if they do not corrupt existing data in the database e.g. you may remove an attribute from the schema, but only if all of the existing entities in the collection have that attribute set to undefined.

In production, it is recommended that you do not make backwards incompatible changes if your client applications have a durable cache, e.g. one using IndexedDB. You can ensure that all backwards incompatible changes are rejected by the server by setting the triplit schema push --enforceBackwardsCompatibility flag.

triplit schema push
This command will look at the schema defined at ./triplit/schema.ts and attempt to apply it to the server while it's still running. If the schema is backwards compatible, it will be applied immediately. If the schema has potentially dangerous changes that do not violate any data integrity constraints, it will also be applied. This behavior is useful for development, but in production, you should always use the --enforceBackwardsCompatibility flag to ensure that the schema is backwards compatible.

Read more about the schema push command and its options.

Client compatibility
When a client connects to a Triplit server, it compares the schema it has stored locally with the schema on the server. If the schemas are incompatible, the client will refuse to connect to the server. This is a safety feature to prevent data corruption. That does not mean that you can't update your schema on the server, but you must do so in a way that is backwards compatible. This page describes the tools Triplit provides to make this process as smooth as possible.

Guided example
In this section, we'll walk through a simple example of how to update a schema in production. We'll start with a simple schema, add an attribute to it, and then push the schema to the server. We'll also cover how to handle backwards incompatible changes.

Getting setup
Let start with a simple schema, defined at ./triplit/schema.ts in your project directory.

./triplit/schema.ts
import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean({ default: false }),
    }),
  },
});

You can start the development server with the schema pre-loaded.

triplit dev

By default, the server will use in-memory storage, meaning that if you shut down the server, all of your data will be lost. This can be useful when you're early in development and frequently iterating on your schema. If you like this quick feedback loop but don't want to repeatedly re-insert test data by hand, you can use Triplit's seed commands. You can use seed command on its own:

triplit seed run my-seed

Or use the --seed flag with triplit dev:

triplit dev --seed=my-seed

If you want a development environment that's more constrained and closer to production, consider using the SQLite persistent storage option for the development server:

triplit dev --storage=sqlite

Your database will be saved to triplit/.data. You can delete this folder to clear your database.

Updating your schema
Let's assume you've run some version of triplit dev shown above and have a server up and running with a schema. You've also properly configured your .env such that Triplit CLI commands will be pointing at it. Let's also assume you've added some initial todos:

App.tsx
import { TriplitClient } from '@triplit/client';
import { schema } from '../triplit';
 
const client = new TriplitClient({
  schema,
  serverUrl: import.meta.env.VITE_TRIPLIT_SERVER_URL,
  token: import.meta.env.VITE_TRIPLIT_TOKEN,
});
 
client.insert('todos', { text: 'Get groceries' });
client.insert('todos', { text: 'Do laundry' });
client.insert('todos', { text: 'Work on project' });

Adding an attribute
Now let's edit our schema by adding a new tagId attribute to todos, in anticipation of letting users group their todos by tag.

./triplit/schema.ts
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean({ default: false }),
      tagId: S.String(),
    }),
  },
});

Pushing the schema
We're trying to mimic production patterns as much as possible, so we're not going to restart the server to apply this change (and in fact, that would cause problems, as we'll soon see). Instead let's use a new command:

triplit schema push
This will look at the schema defined at ./triplit/schema.ts and attempt to apply it to the server while it's still running. In our case, it fails, and we get an error like this:

✖ Failed to push schema to server
Found 1 backwards incompatible schema changes.
Schema update failed. Please resolve the following issues:
Collection: 'todos'
        'tagIds'
                Issue: added an attribute where optional is not set
                Fix:   make 'tagIds' optional or delete all entities in 'todos' to allow this edit
What's at issue here is that we tried to change the shape/schema of a todo to one that no longer matches those in the database. All attributes in Triplit are required by default, and by adding a new attribute without updating the existing todos, we would be violating the contract between the schema and the data.

Thankfully, the error gives us some instructions. We can either

Make tagId optional e.g. tagIds: S.Optional(S.String()) and permit existing todos to have a tagId that's undefined.
Delete all of the todos in the collection so that there isn't any conflicting data.
While 2. might be acceptable in development, 1. is the obvious choice in production. In production, we would first add the attribute as optional, backfill it for existing entities with calls to client.update, as well as upgrade any clients to start creating new todos with tagId defined. Only when you're confident that all clients have been updated to handle the new schema and all existing data has been updated to reflect the target schema, should you proceed with a backwards incompatible change.

Whenever you try to triplit schema push, the receiving database will run a diff between the current schema and the one attempting to be applied and surface issues like these. Here are all possible conflicts that may arise.

Fixing the issues
Let's make tagId optional:

./triplit/schema.ts
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean({ default: false }),
      tagId: S.Optional(S.String()),
    }),
  },
});

Now we can run triplit schema push again, and it should succeed. For completeness, let's also backfill the tagId for existing todos:

await client.transact(async (tx) => {
  const allTodos = await tx.fetch(client.query('todos'));
  for (const [_id, todo] of allTodos) {
    await tx.update('todos', todo.id, (entity) => {
      entity.tagId = 'chores';
    });
  }
});

We've now successfully updated our schema in a backwards compatible way. If you're confident that all clients have been updated to handle the new schema and all existing data has been updated to reflect the target schema, you can then choose to make tagId required.

Curing backwards incompatible changes
Adding an attribute where optional is not set
Like in the example above, these changes will be backwards incompatible if you have existing entities in that collection. In production, only add optional attributes, and backfill that attribute for existing entities.

Removing a non-optional attribute
This is a backwards incompatible change, as it would leave existing entities in the collection with a missing attribute. In production, deprecate the attribute by making it optional, delete the attribute from all existing entities (set it to undefined), and then you be allowed to remove it from the schema.

Removing an optional attribute
While not technically a backwards incompatible change, it would lead to data loss. In production, delete the attribute from all existing entities first (set it to undefined) and then it will be possible to remove it from the schema.

Changing an attribute from optional to required
This is a backwards incompatible change, as existing entities with this attribute set to undefined will violate the schema. In production, update all existing entities to have a non-null value for the attribute, and then you will be able to make it required.

Changing the type of an attribute
Triplit will prevent you from changing the type of an attribute if there are existing entities in the collection. In production, create a new optional attribute with the desired type, backfill it for existing entities, and then remove the old attribute following the procedure described above ("Removing an optional attribute").

Changing the type of a set's items
This is similar to changing the type of an attribute, but for sets. In production, create a new optional set attribute with the desired type, backfill it for existing entities, and then remove the old set following the procedure described above ("Removing an optional attribute").

Changing an attribute from nullable to non-nullable
Triplit will prevent you from changing an attribute from nullable to non-nullable if there are existing entities in the collection for which the attribute is null. In production, update all of the existing entities to have a non-null value for the attribute and take care that no clients will continue writing null values to the attribute. Then you will be able to make it non-nullable.

Changing a string to an enum string or updating an enum
Triplit will prevent you from changing a string to an enum string or updating an enum if there are existing entities in the collection with values that are not in the new enum. In production, update all of the existing entities to have a value that is in the new enum and then you will be able to make the change.

Removing a relation
Because relations in Triplit are just views on data in other collections, removing a relation will not corrupt data but can still lead to backward-incompatible behavior between client and server. For instance, if the server's schema is updated to remove a relation, but an out-of-date client continues to issues queries with clauses that reference that relation, such as include, a relational where filter, or an exists filter, the server will reject those queries. In production, you may need to deprecate clients that are still using the old relation and force them to update the app with the new schema bundled in.

Handling schema changes in the client
onDatabaseInit hook
Triplit provides a hook onDatabaseInit that runs after your client-side database has initialized and before any client operations are run and syncing begins. It will report any issues related to updating the schema on database initialization through the event parameter. In the case of a successful migration, the database in the hook will have the latest schema applied. In the case of a failure, the database will have the currently saved schema applied.

An event may be one of the following type:

SUCCESS: The database was initialized successfully and is ready to be used.
SCHEMA_UPDATE_FAILED: The database was unable to update the schema. This may be due to a backwards incompatible change or a failure to migrate existing data. Alongside this type, the event will also have a change object that contains information about the schema change that failed. This object has the following properties:
code: The code of the error that occurred. This will be one of the following:
EXISTING_DATA_MISMATCH: The schema change failed because there was existing data in the database that did not match the new schema.
SCHEMA_UPDATE_FAILED: The schema change failed for some other reason.
newSchema: The new schema that was attempted to be applied.
oldSchema: The old schema that was in place before the update.
ERROR: An error occurred while initializing the database. The event will have an error property that contains the error that occurred.
Below is an example of how to use the onDatabaseInit hook to clear data from your local database if the schema cannot be migrated:

import { TriplitClient } from '@triplit/client';
import { Schema as S } from '@triplit/client';
 
const client = new TriplitClient({
  schema: S.Collections({
    // Your schema here
  }),
  experimental: {
    onDatabaseInit: async (db, event) => {
      if (event.type === 'SUCCESS') return;
      if (event.type === 'SCHEMA_UPDATE_FAILED') {
        if (event.change.code === 'EXISTING_DATA_MISMATCH') {
          // clear local database
          await db.clear();
          // retry schema update
          const nextChange = await db.overrideSchema(event.change.newSchema);
          // Schema update succeeded!
          if (nextChange.successful) return;
        }
      }
      // handle other cases...
 
      // Handle fatal states as you see fit
      telemetry.reportError('database init failed', {
        event,
      });
      throw new Error('Database init failed');
    },
  },
});
LastData types
When using a schema you have a few datatypes at your disposal:

Collections and Schema types
The Collections and Schema schema types are used to define your collections and their attributes. They are simple record types but will help provide type hinting and validation to their parameters.

import { Schema as S } from '@triplit/client';
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      // Additional attributes here...
    }),
  },
});
Primitive types
Primitive types are basic types for the database.

Id
The Id data type is a convenience String type used for entity identifiers. It automatically generates unique IDs when entities are inserted without an explicit id value.

import { Schema as S } from '@triplit/client';
const idType = S.Id({
  format: 'nanoid', // or 'uuidv4' or 'uuidv7'
});
Valid options for the Id type include:

format: Specifies the ID generation format. Options are:
'nanoid' (default): Generates a 21-character URL-safe ID using nanoid. Pre-installed on both client and server.
'uuidv4': Generates a standard UUID v4. Uses native functionality, no additional package required.
'uuidv7': Generates a UUID v7 with timestamp ordering. Requires the uuidv7 package on the client (pre-installed on server).
// Examples of different ID formats
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(), // defaults to nanoid
      text: S.String(),
    }),
  },
  users: {
    schema: S.Schema({
      id: S.Id({ format: 'uuidv4' }),
      name: S.String(),
    }),
  },
  posts: {
    schema: S.Schema({
      id: S.Id({ format: 'uuidv7' }),
      title: S.String(),
    }),
  },
});
For uuidv7 format, install the package on the client: e.g. npm install uuidv7

String
The string data type is used to store text.

import { Schema as S } from '@triplit/client';
const stringType = S.String({
  // options
});
Valid options for the string type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
default: Provides a default value or function for the attribute. Possible values include:
S.Default.Id.nanoid(): Generates a nanoid (21-character URL-safe ID)
S.Default.Id.uuidv4(): Generates a UUID v4
S.Default.Id.uuidv7(): Generates a UUID v7 (requires uuidv7 package on client)
string: A literal string value.
enum: An array of strings that restricts the possible values of the attribute. This will perform runtime validation and provide autocomplete in your editor.
For information about operators that can be used with strings in where statements, see the Where clause documentation.

Number
The number data type is used to store integer or float numbers.

import { Schema as S } from '@triplit/client';
const numberType = S.Number({
  // options
});
Valid options for the number type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
default: Provides a default value or function for the attribute. Possible values include:
number: A literal number value.
For information about operators that can be used with numbers in where statements, see the Where clause documentation.

Boolean
The boolean data type is used to store true or false values.

import { Schema as S } from '@triplit/client';
const booleanType = S.Boolean({
  // options
});
Valid options for the boolean type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
default: Provides a default value or function for the attribute. Possible values include:
boolean: A literal boolean value.
For information about operators that can be used with booleans in where statements, see the Where clause documentation.

Date
The date data type is used to store date and time values.

import { Schema as S } from '@triplit/client';
const dateType = S.Date({
  // options
});
Valid options for the date type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
default: Provides a default value or function for the attribute. Possible values include:
S.Default.now(): Generates the current date and time.
string: An ISO 8601 formatted string.
For information about operators that can be used with dates in where statements, see the Where clause documentation.

Set
Set types are used to store a collection of non nullable value types. Sets are unordered and do not allow duplicate values.

Lists, which support ordering and duplicate values, are on the roadmap.

import { Schema as S } from '@triplit/client';
const stringSet = S.Set(S.String(), {
  // options
});
The first argument to the Set constructor is the type of the values in the set. This can be any of the primitive types, including S.String(), S.Number(), S.Boolean(), or S.Date().

Valid options for the set type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
default: Provides a default value or function for the attribute. Possible values include:
S.Default.Set.empty(): Generates an empty set.
For information about operators that can be used with sets in where statements, see the Where clause documentation.

Record
The record types allow you model nested information with known keys, similar to a struct in C.

import { Schema as S } from '@triplit/client';
const recordType = S.Record(
  {
    street: S.String(),
    city: S.String(),
    state: S.String(),
    zip: S.String(),
  },
  {
    // options
  }
);
The first argument to the Record constructor is an object that defines the keys and their types. This can be any data type.

Valid options for the record type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
For information about operators that can be used with records in where statements, see the Where clause documentation.

Optional keys
You can indicate an attribute is optional by passing the { nullable: true } option to its constructor or wrapping the attribute in S.Optional. Optional attributes may not exist, have the value undefined, or have the value null - these are all equivalent in Triplit.

Under the hood S.Schema() is a record type, so optional attributes allow you to define optional keys in your schema as well.

import { Schema as S } from '@triplit/client';
const schema = S.Collections({
  test: {
    schema: S.Schema({
      id: S.Id(),
      // S.Optional and nullable are equivalent
      optionalString: S.Optional(S.String()),
      alsoOptionalString: S.String({ nullable: true }),
    }),
  },
});
 
await client.insert('test', {
  id: '123',
});
 
// { id: '123' }
 
await client.update('test', '123', (e) => {
  e.optionalString = 'hello';
});
 
// { id: '123', optionalString: 'hello' }
 
await client.update('test', '123', (e) => {
  delete e.optionalString;
});
 
// { id: '123', optionalString: null }
For information about operators that can be used with optional attributes in where statements, see the Where clause documentation.

Json
The json type is used to store arbitrary JSON data that is spec compliant. This type is useful for storing unstructured data or data that may change frequently.

Valid primitive types for the json type include:

string
number
boolean
null
You may also store arrays and objects containing any of the above types.

import { Schema as S } from '@triplit/client';
const jsonType = S.Json({
  // options
});
Valid options for the json type include:

nullable: Indicates the value is optional when used in a Record. This is equivalent to wrapping the attribute in S.Optional.
default: Provides a default value or function for the attribute. Possible values include:
json: A literal JSON value.
Any default value for the primitive types that are JSON compliant.
LastRelations
To define a relationship between two collections, you define a subquery that describes the relationship with RelationMany, RelationOne or RelationById. while RelationOne and RelationById are designed for singleton relations and will be directly nested or a sub-object or null if an applicable entity doesn't exist. Within a relation, either in a where clause or the RelationById id, parameter, you can reference the current collection's attributes with $.

RelationMany
A RelationMany attribute will be in the shape Array<Entity>. It's designed to model a one-to-many relationship between two collections. If no related entities are found, the attribute will be an empty array.

In this example schema, we are modeling a school, where departments have many classes. The departments collection has a classes attribute that is a RelationMany to the classes collection.

import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  departments: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
    }),
    relationships: {
      classes: S.RelationMany('classes', {
        where: [['department_id', '=', '$id']],
      }),
    },
  },
  classes: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
      level: S.Number(),
      building: S.String(),
      department_id: S.String(),
    }),
  },
});
RelationOne
A RelationOne attribute will be an Entity or null. It's designed to model a one-to-one relationship between two collections. The RelationOne attribute will be the related entity or null if no related entity is found.

We can update our model of a school, so that a class has a relation to its department.

import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  departments: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
    }),
    relationships: {
      classes: S.RelationMany('classes', {
        where: [['department_id', '=', '$id']],
      }),
    },
  },
  classes: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
      level: S.Number(),
      building: S.String(),
      department_id: S.String(),
    }),
    relationships: {
      department: S.RelationOne('departments', {
        where: [['id', '=', '$department_id']],
      }),
    },
  },
});
RelationById
RelationById is a special case of RelationOne that is used to define a relationship by a foreign key. The RelationById attribute will be the related entity or null if no related entity is found.

We can update the previous example to use RelationById instead of RelationOne.

import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  departments: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
    }),
    relationships: {
      classes: S.RelationMany('classes', {
        where: [['department_id', '=', '$id']],
      }),
    },
  },
  classes: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
      level: S.Number(),
      building: S.String(),
      department_id: S.String(),
    }),
    relationships: {
      department: S.RelationById('departments', '$department_id'),
    },
  },
});
Querying collections with relations
By default, queries on collections with relations will not return related data. You can use the include method to specify which relations you want to include in the query.

const classesQuery = client.query('classes').Include('department');
const departmentsQuery = client.query('departments').Include('classes');
Defining relations with referential variables
You can also define relations ad-hoc in a query using referential variables. This allows you to define relations that are not part of the schema and is equivalent to a JOIN you might see in SQL. Under the hood, this is actually what your RelationMany, RelationOne, and RelationById attributes are doing. See usage of referential variables in the Variables documentation. For example:

// Fetch all 747 planes that have a flight to an airport newer than the plane
const query = client.query('planes').Where([
  ['model', '=', '747']
  {
    exists: client.query('flights').Where([
      ['plane_id', '=', '$1.id'],
      {
        exists: client.query('airports').Where([
          ['id', '=', '$1.destination_id']
          ['created_at', '>', '$2.created_at'],
        ]),
      },
    ]),
  },
]);
LastAuthorization and access control
Access control checks run exclusively on the server, and are not enforced on the client. Invalid writes will only be rejected when they have been sent to the server.

Triplit provides a flexible way to define access control rules for your database, ensuring that your application data is secure without the need for complex server-side logic.

Roles
When a client authenticates with a Triplit server and begins a session, it provides a token that contains some information about itself (see authentication for more information on tokens). The server will assign that token some number of roles based on the claims present in the token.

Default roles
anonymous
The server will assign the anonymous role to any client that presents the anon token generated in the Triplit dashboard or by the Triplit CLI. You might use this token to allow unauthenticated users to access your database.

authenticated
The server will assign the authenticated role to any client that presents a token that has a sub claim. The sub or "subject" claim is a standard JWT claim that identifies the principal user that is the subject of the JWT. Tokens with the sub claim should be issued by an authentication provider such as Clerk or Supabase. Because the sub claim is a unique identifier, we can use it to both attribute data to a user and to restrict access to that data to them.

Example usage
You might use the anonymous role to allow unauthenticated users to read your database, but restrict inserts and updates to authenticated users. The following example allows any user to read the todos collection, but only authenticated users to insert or update todos:

schema.ts
import { Schema as S } from '@triplit/client';
 
export const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      anonymous: {
        read: {
          filter: [true],
        },
      },
      authenticated: {
        read: {
          filter: [true],
        },
        insert: {
          filter: [['authorId', '=', '$token.sub']],
        },
        update: {
          filter: [['authorId', '=', '$token.sub']],
        },
        delete: {
          filter: [['authorId', '=', '$token.sub']],
        },
      },
    },
  },
});

Custom roles
The default roles exist to make it possible to add authorization rules to your database with minimal configuration. However, your app may require more complicated role-based permission schemes than can't be modeled with only the defaults. In that case you can define your own roles.

Each custom role must have a name and a match object. When a client authenticates with a Triplit server, Triplit will check if the token matches any defined roles in the schema. If it does, the client is granted that role and will be subject to any permissions that have been defined for that it.

For example, you may author admin and user tokens with the following structure:

schema.ts
import { Roles } from '@triplit/client';
 
const roles: Roles = {
  admin: {
    match: {
      type: 'admin',
    },
  },
  user: {
    match: {
      type: 'user',
      sub: '$userId',
    },
  },
};

Wildcards in the match object (prefixed with $) will be assigned to variables with the prefix $role. For example, a JWT with the following structure would match the user role and assign the value 123 to the $role.userId variable for use in your application's permission definitions:

// match object
{
  "type": "user",
  "sub": "$userId",
}
// Token
{
  "type": "user",
  "sub": 123
}
// Query - resolves to db.query('todos').Where('authorId', '=', 123);
db.query('todos').Where('authorId', '=', '$role.userId');
You do not need to assign a token's sub claim to a $role variable to reference it in a filter. You can access all of the claims on a token directly by using the $token variable prefix. e.g. $token.sub.

Your schema file should export the roles object for use in your schema definitions.

Combining custom and default roles
The default roles will only be applied to tokens when your schema has not defined any custom roles. If you define a custom role, the default roles will not be applied to any tokens. If you want to reuse the default and add your own, you can do so with the DEFAULT_ROLES constant.

schema.ts
import { DEFAULT_ROLES, type Roles, Schema as S } from '@triplit/client';
const roles: Roles = {
  ...DEFAULT_ROLES,
  admin: {
    match: {
      type: 'admin',
    },
  },
  user: {
    match: {
      type: 'user',
      sub: '$userId',
    },
  },
};

Permissions
Access control at the attribute level is not yet supported, but will be in a future release.

By default, there are no access controls on the database and they must be configured by adding a permissions definition to the schema. Each collection in a schema can have a permissions object that defines the access control rules for that collection. Once a permissions object is defined, Triplit will enforce the provided rules for each operation on the collection. If no rules for an operation are provided, the operation not be allowed by default.

The following example turns off all access to the todos collection so it is only accessible with your service token:

schema.ts
import { type Roles, Schema as S } from '@triplit/client';
 
const roles: Roles = {
  // Role definitions
};
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {},
  },
});
 
export { schema, roles };

Collection permissions are defined for each operation and role. If a role is not included, it will not be allowed to perform that operation. When performing each operation, Triplit will check the set of set of filter clauses that must be satisfied for the operation to be allowed.

{
   "role": {
      "operation": {
         "filter": // Boolean filter expression
      }
   }
}
Read
To allow clients to read data, you must define a read permission that specifies the roles that may read data and any additional restrictions. The following example allows a user to read the todos that they authored and an admin to read any todo:

schema.ts
import { type Roles, Schema as S } from '@triplit/client';
 
const roles: Roles = {
  // Role definitions
};
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      admin: {
        read: {
          // Allow all reads
          filter: [true],
        },
      },
      user: {
        read: {
          // Allow reads where authorId is the user's id
          filter: [['authorId', '=', '$role.userId']],
        },
      },
    },
  },
});
 
export { schema, roles };

Insert
To allow clients to insert data, you must define an insert permission that specifies the roles that may insert data and any additional restrictions. The following example allows a user to insert a todo that they author and an admin to insert any todo:

schema.ts
import { type Roles, Schema as S } from '@triplit/client';
 
const roles: Roles = {
  // Custom role definitions
};
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      admin: {
        insert: {
          // Allow all inserts
          filter: [true],
        },
      },
      user: {
        insert: {
          // Allow inserts where authorId is the user's id
          filter: [['authorId', '=', '$role.userId']],
        },
      },
    },
  },
});
 
export { schema, roles };

Update
To allow users to update data, you must define an update permission that specifies the roles that may update data and any additional restrictions. For updates, the permission is checked against the "old" state of the entity, before it has been updated. The following example allows a user to update todos that they authored and an admin to update any todo:

schema.ts
import { type Roles, Schema as S } from '@triplit/client';
 
const roles = {
  // Custom role definitions
};
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      admin: {
        update: {
          // Allow all updates
          filter: [true],
        },
      },
      user: {
        update: {
          // Allow updates where authorId is the user's id
          filter: [['authorId', '=', '$role.userId']],
        },
      },
    },
  },
});
 
export { schema, roles };

Post update
You may also optionally define a postUpdate permission that will be run after an update operation has been completed. This is useful for confirming that updated data is valid. For example, this checks that a user has not re-assigned a todo to another user:

schema.ts
import { type Roles, Schema as S } from '@triplit/client';
 
const roles: Roles = {
  // Custom role definitions
};
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      user: {
        update: {
          // Allow updates where authorId is the user's id
          filter: [['authorId', '=', '$role.userId']],
        },
        postUpdate: {
          // Check that the authorId has not changed
          filter: [['authorId', '=', '$role.userId']],
        },
      },
    },
  },
});
 
export { schema, roles };

$prev variable
The postUpdate permission has access to the previous value of the document via the $prev variable. This allows you to check that the new value is valid in the context of the old value, e.g. that the previous value was unchanged:

schema.ts
import { type Roles, Schema as S } from '@triplit/client';
const roles: Roles = {
  // Custom role definitions
};
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
      updatedAt: S.Date(),
      completed: S.Boolean(),
    }),
    permissions: {
      user: {
        read: {
          filter: [true],
        },
        insert: {
          filter: [true],
        },
        update: {
          filter: [['authorId', '=', '$role.userId']],
        },
        postUpdate: {
          // Check that the authorId has not changed
          // and that the updatedAt date is greater than the previous value
          filter: [
            ['authorId', '=', '$prev.authorId'],
            ['updatedAt', '>', '$prev.updatedAt'],
          ],
        },
      },
    },
  },
});

Delete
To allow users to delete data, you must define a delete permission that specifies the roles that may delete data and any additional restrictions. The following example allows a user to delete todos that they authored and an admin to delete any todo:

import { type Roles, Schema as S } from '@triplit/client';
 
// schema.ts
const roles: Roles = {
  // Custom role definitions
};
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      admin: {
        delete: {
          // Allow all deletes
          filter: [true],
        },
      },
      user: {
        delete: {
          // Allow deletes where authorId is the user's id
          filter: [['authorId', '=', '$role.userId']],
        },
      },
    },
  },
});
 
export { schema, roles };
Editing permissions
Permissions are a part of your schema and can be added or updated by modifying your schema. In a future release, you will be able to manage permissions in your project's Dashboard.

Modeling permissions with external authentication
When using an external authentication provider like Clerk, the provider is the source of truth for identifying users. This means that in your Triplit database you might not need a traditional users collection. Permissions that restrict access to specific authenticated users should use the ids provided by the auth service. If you want to store additional information about a user in Triplit, we recommend using a profiles collection that uses the same ID as the user ID provided from your auth provider. When your app loads and a user authenticates, you can fetch their profile or create it if it doesn't exist. Here’s an example schema:

schema.ts
import { type Roles, Schema } from '@triplit/client';
 
const roles: Roles = {
  user: {
    match: {
      sub: '$userId',
    },
  },
};
 
const schema = S.Collections({
  profiles: {
    schema: S.Schema({
      id: S.Id(), // Use the user ID from your auth provider when inserting
      nickname: S.String(),
      created_at: S.Date({ default: S.Default.now() }),
    }),
    permissions: {
      user: {
        read: {
          filter: [['id', '=', '$role.userId']],
        },
        update: {
          filter: [['id', '=', '$role.userId']],
        },
        insert: {
          filter: [['id', '=', '$role.userId']],
        },
      },
    },
  },
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      user: {
        read: {
          filter: [['authorId', '=', '$role.userId']],
        },
        insert: {
          filter: [['authorId', '=', '$role.userId']],
        },
        update: {
          filter: [['authorId', '=', '$role.userId']],
        },
        delete: {
          filter: [['authorId', '=', '$role.userId']],
        },
      },
    },
  },
});

Modeling selective public access
Sometimes you may want to allow a user to share a link to a resource that is not publicly accessible. For example, you have a table documents and only the author can read their own documents.

const schema = S.Collections({
  documents: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      content: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      authenticated: {
        read: {
          filter: [
            // Only the author can read their own documents
            ['authorId', '=', '$role.userId'],
          ],
        },
      },
    },
  },
});
To allow selective public access, you can use the or function to add another filter with a $query variable, allowing the requesting user to read the document if they know the id.

const schema = S.Collections({
  documents: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      content: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      authenticated: {
        read: {
          filter: [
            or([
              // Only the author can read their own documents
              ['authorId', '=', '$role.userId'],
              // Anyone can read the document if they know the id
              ['id', '=', '$query.docId'],
            ]),
          ],
        },
      },
    },
  },
});
A client requesting the document can use the Vars method on the query builder to pass in the docId variable to the query:

const query = client
  .query('documents')
  .Vars({ docId: '1234' }) // Allows access to the document with id 1234
  .Where('id', '=', '1234'); // Filters to just the document with id 1234
 
const document = await client.fetch(query);
Now you can implement a shareable link like https://myapp.com/share/1234 and use that id (1234) to fetch a document as needed!

LastAuthentication
In this guide we'll show you how to identify users connecting to your Triplit server and how to model access control with that information. By the end of the guide, you'll be able to define a schema that allows users to insert and update their own data, but not other users' data:

schema.ts
export const schema = S.Collections({
  blogPosts: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      content: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      authenticated: {
        read: { filter: [true] },
        insert: { filter: ['authorId', '=', '$token.sub'] },
        update: { filter: ['authorId', '=', '$token.sub'] },
        postUpdate: { filter: ['authorId', '=', '$token.sub'] },
        delete: { filter: ['authorId', '=', '$token.sub'] },
      },
    },
  },
});
Choose an authentication provider
You'll likely start out your project using the anon and service tokens provided by default. These are great for getting started, but don't provide any user-specific information that you'll need to model access control.

Choose from one of the many authentication providers that issue JWTs:

Clerk: read the Triplit integration guide here
Supabase: read the Triplit integration guide here
Auth0
Amazon Cognito
...or any other provider that issues JWTs
Allow your Triplit server to verify JWTs
If you're using a third-party authentication provider, you'll need to provide the public key or secret that it's using to sign JWTs to your Triplit server so it can verify them. Triplit supports both symmetric (e.g. HMAC) and asymmetric (e.g. RSA) JWT encryption algorithms.

If you're connecting to a triplit.io URL, you can use the dashboard. If you're fully self-hosting Triplit (and not pointed at a triplit.io URL), you'll need to set the EXTERNAL_JWT_SECRET environmental variable to the public key or symmetric secret.

Pass the token to Triplit
Once you have your authentication provider set up in your app and your user is signed in, you'll need to pass the JWT to Triplit. This is done by calling startSession on the TriplitClient instance.

import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
});
 
function onPageLoad() {
  // get the user's token from your authentication provider
  const token = await auth.getToken({ skipCache: true });
  if (token) {
    if (client.token) {
      await client.endSession();
    }
    await client.startSession(token);
  }
}
Connections to the server are managed with the Sessions API. Read more about it here.

Add permissions to your schema
Access control to data on a Triplit server is defined by permissions in the schema. Permissions can reference the JWT claims that are passed to Triplit. Once you've added permissions, you need to run npx triplit schema push to have them take effect on a deployed server (or just restart the development server if you're running it locally.).

schema.ts
export const schema = S.Collections({
  blogPosts: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      content: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      authenticated: {
        read: { filter: [true] },
        insert: { filter: ['authorId', '=', '$token.sub'] },
        update: { filter: ['authorId', '=', '$token.sub'] },
        postUpdate: { filter: ['authorId', '=', '$token.sub'] },
        delete: { filter: ['authorId', '=', '$token.sub'] },
      },
    },
  },
});
These permissions will allow any authenticated user to read all blog posts, but only allow them to insert, update, and delete their own posts. Notice that permissions are defined as query filters. This means that a permissions can be as complex as a query, and use or, exists and other query operators. Permissions can also reference relationships and/or any of the JWT claims on the user's $token. In this case, we're using the sub claim to identify the user. This is the default claim that most authentication providers will use to identify the user.

Use token claims when inserting or updating data
When Triplit is given a JWT token, it makes the decoded claims available through the TriplitClient.vars.$token. If your collections have fields that are set to identifiable information from the token, you can access it there and use it in your calls to insert or update.

Using the blogPosts example from above, you can set the authorId field to the user's sub claim when inserting a new post:

import { TriplitClient } from '@triplit/client';
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
});
 
const token = await auth.getToken({ skipCache: true });
 
await client.startSession(token);
await client.insert('posts', {
  title: 'My first blog post',
  content: 'Hello world!',
  authorId: client.vars.$token.sub, // set the authorId to the user's id
});
Add additional roles (optional).
Triplit has two default roles: authenticated and anonymous. The authenticated role is used for any user that connect with a JWT that has a sub claim. The anonymous role is assigned to any client that connects with the Triplit-generated anon token. This is a special token that is safe to use on the client side and should be used when no user is logged in.

You may find that you need to create additional roles for your application. For example, you may have an admin role that is distinct from a normal user. See the permissions guide for more information.

Debugging authentication
If you are having trouble connecting to the server, there are a few things to try:

pass the logLevel: 'debug' option to the TriplitClient constructor to get more information about the connection process and failures.
confirm that your serverUrl is correct and that the server is running.
check that the JWT being issued by your authentication provider is valid and has not expired. You can use jwt.io to decode the JWT and check its claims.
check that the your Triplit server is configured to accept the JWT. If you're using a third-party authentication provider, make sure that the public key or secret is set correctly in your Triplit server. If you're using a self-hosted server, make sure that the EXTERNAL_JWT_SECRET environmental variable is set.
LastSessions
Triplit models connections with the server as sessions. Sessions are created when the client is initialized with a token, or by calling startSession. They end when endSession is called. When using durable storage like IndexedDB, they persist through page reloads, and when the client loses connection to the server. This ensures that the server sends only the changes that the client missed while it was disconnected.

Triplit client sessions are easy to map to user authentication sessions, but they don't have to. They can also represent different states of the client, like a session for a guest user and a session for a logged-in user.

startSession
You have two options to start a session: when you initialize the client or by calling startSession. You usually want to initialize your client as early as possible in the lifecycle of your app, which may be before you have a token. In this case, you can create a Triplit Client without a token and then later call startSession when you have one.

import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
});
 
await client.startSession('your-token');
or

import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
  token: 'your-token',
});
You can can also decide whether or not the client should autoConnect to the server when you start a session. If you set autoConnect to false, you can manually connect with the client.connect() method.

await client.startSession('your-token', false);
 
// time passes
 
client.connect();
TriplitClient.startSession will automatically end the previous session if one is already active.

Refreshing a session
Most authentication providers issue tokens that expire after a certain amount of time. Triplit servers will close the connection with a client when they detect that its token has expired. To prevent this, and keep the connection open, you can provide a refreshHandler to the client. The refreshHandler is a function that returns a new token, or null. The client will call this function 1 second before the token expires, as determined from the exp claim.

import { TriplitClient } from '@triplit/client';
import { getFreshToken } from './auth';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
});
 
await client.startSession('your-token', true, {
  refreshHandler: async () => {
    // get a new token
    return await getFreshToken();
  },
});
 
// or in the constructor
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
  token: 'your-token',
  refreshOptions: {
    refreshHandler: async () => {
      // get a new token
      return await getFreshToken();
    },
  },
});
You can also provide an interval to the refreshOptions to set the time in milliseconds that the client will wait before calling the refreshHandler again. You should do this if you know the token's expiration time and want more control over when it gets refreshed.

await client.startSession('your-token', true, {
  interval: 1000 * 60 * 5, // 5 minutes
  refreshHandler: async () => {
    // get a new token
    return await getFreshToken();
  },
});
If you want even more granular control over when the client refreshes the token, you can call updateSessionToken with a new token.

import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
  token: 'your-token',
});
 
// later
await client.updateSessionToken('your-new-token');
It's important that tokens used to refresh a session have the same roles as the original token. They are intended to represent that same user, with the same permissions, as interpreted by roles assigned it by the server and its schema. Read more on roles here. If you attempt to update the token with a token that has different roles, the server will close the connection and send a ROLES_MISMATCH error.

endSession
When a user logs out, you should end the session. This will close the connection to the server, cleanup any refresh events, and clear some metadata about the session.

import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
  token: 'your-token',
});
 
// when ready to end session
await client.endSession();
// If signing out, it is recommended to also clear your local database
await client.clear();
Calling endSession will not clear the the client's database. If you want to clear the cache, you should call client.clear().

onSessionError
onSessionError is a function that is called when the client receives an error from the server about the session, which will lead to the sync connection to being terminated. This can be used to end the session, restart it, and/or clear the cache. Potential error cases include:

UNAUTHORIZED: the token can't be verified, either because it is expired, is signed with the wrong key, or otherwise unable to be parsed. This indicates that the client has been given an erroneous token or, if you're certain that the token is valid, that the server is misconfigured.
SCHEMA_MISMATCH: the schema of the client and the server are out of sync.
TOKEN_EXPIRED: the previously valid token that had been used to authenticate the client has expired and the client will no longer receive messages. This message is sent not at the exact time that the token expires, but when the client attempts to send a message to the server or vice versa and the server detects that the token has expired.
ROLES_MISMATCH: occurs when the client attempts to update the token with the refreshHandler option for startSession or when using updateSessionToken. This error is sent when the client attempts to update the token with a token that has different roles than the previous token. This is a security feature to prevent a user from changing their privileges by updating their token with one that has different roles.
import { TriplitClient } from '@triplit/client';
 
const client = new TriplitClient({
  serverUrl: 'https://<project-id>.triplit.io',
  token: 'your-token',
  onSessionError: (type) => {
    if (type === 'TOKEN_EXPIRED') {
      // log the user out
      await client.endSession();
      await client.clear();
    }
  },
});
LastUsing Supabase Auth with Triplit
Supabase Auth is one of the services in the Supabase ecosystem that makes it easy to manage user accounts and authentication in your application. This guide will show you how to set up Supabase Auth with Triplit.

This guide assumes you have a Triplit project set up. If you don't have one, you can create one by following the Quick Start guide.

Create a Supabase account and project
Use the Supabase dashboard to create an account and a project. This will setup a Postgres database and a Supabase Auth instance for your project.

Get the JWT Secret for your Supabase project
We also need to configure Triplit to validate the JWT tokens issued by Supabase. To do this, we need the JWT signing secret for your Supabase project. You can find this in the JWT Settings panel section of the API Settings panel.

Supabase API Settings

For local dev, add this to your .env file in your Triplit app:

TRIPLIT_EXTERNAL_JWT_SECRET=<supabase-jwt-secret>

Start the Triplit development server
Now that we've configured Supabase and added the necessary environmental variables, we can start the Triplit development server:

npx triplit dev
Add Supabase Auth to your Triplit app
Your app should have some flow to authenticate a user that uses Supabase's authentication methods. Once a user is signed in, your Triplit client needs to send the JWT token issued by Supabase with each request, and handle other authentication events.

import { createClient } from '@supabase/supabase-js';
import { TriplitClient } from '@triplit/client';
import { schema } from './schema';
 
const supabase = createClient(
  'https://<project>.supabase.co',
  '<your-anon-key>'
);
 
const triplit = new TriplitClient({
  schema,
  serverUrl: 'http://localhost:6543',
});
 
function getSessionAndSubscribe() {
  const { data: session } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      switch (event) {
        case 'INITIAL_SESSION':
        case 'SIGNED_IN':
          await triplit.startSession(session.access_token);
          break;
        case 'SIGNED_OUT':
          await triplit.endSession();
          break;
        case 'TOKEN_REFRESHED':
          triplit.updateSessionToken(session.access_token);
          break;
      }
    }
  );
  return session.subscription.unsubscribe;
}

Generally you'll want to run getSessionAndSubscribe() when your app loads and then unsubscribe from the session changes when your app unmounts.

// on mount
const unsubscribe = getSessionAndSubscribe();
 
// on unmount
unsubscribe();

Test locally
Run you Triplit app and sign in with Supabase Auth. If you’re setup correctly, you should see the connection is established and your data is syncing with your server. If you can't connect, ensure that you set the TRIPLIT_EXTERNAL_JWT_SECRET environmental variables correctly.

Configure your Triplit dashboard
To use Supabase Auth with a deployed Triplit server, you just need ensure that it can use the Supabase JWT Secret to verify incoming requests.

If you're using the Triplit Dashboard, you can add the JWT Secret to the External JWT secret input in your project settings.

Triplit Project Settings

If you're using a custom self-hosted server, you need to set the EXTERNAL_JWT_SECRET environmental variable to the public key.

Add access control to your schema
Now that you have a user auth system set up, you can add permissions to your Triplit schema. By default, the JWT issued by Supabase will set the sub claim to the authenticated user's unique identifier. The server will apply the default authenticated role the token. For a given collection, you can define a permission that only allows any authenticated user to read all posts but only mutate their own.

import { Schema as S } from '@triplit/client';
 
export const schema = S.Collections({
  posts: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      content: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      authenticated: {
        read: { filter: [true] },
        insert: { filter: [['authorId', '=', '$token.sub']] },
        update: { filter: [['authorId', '=', '$token.sub']] },
        delete: { filter: [['authorId', '=', '$token.sub']] },
      },
    },
  },
});

When creating posts, you should ensure that the authorId is set to the sub claim, either taken from the token or the Supabase session.

If you need to model more complex roles or permissions, consult the documentation.

LastUsing Clerk with Triplit
Clerk is a user authentication and management service that makes it easy to add user accounts to your application. It's super simple to get Clerk up and running with Triplit, and this guide will show you how.

This guide assumes you have a Triplit project set up. If you don't have one, you can create one by following the Quick Start guide.

Create a Clerk account and application
Follow the official Clerk documentation to create an account and application in their dashboard.

Get your Clerk public key
We also need to configure Triplit to validate the JWT tokens issued by Clerk. To do this, we need the RSA public key for your Clerk application. You can find this in the API Keys section of the Clerk dashboard.

Clerk API Keys

Then click on the Show JWT Public Key button to reveal the public key.

Clerk JWT Public Key

For local dev, add this to your .env file in your Triplit app, making sure to remove any newlines:

TRIPLIT_EXTERNAL_JWT_SECRET=-----BEGIN PUBLIC KEY-----<some-encoded-stuff>-----END PUBLIC KEY-----

Start the Triplit development server
Now that we've configured Clerk and added the necessary environmental variables, we can start the Triplit development server:

npx triplit dev
Add Clerk to your Triplit app
You can add Clerk to your Triplit app by installing the appropriate SDK. Clerk has official support for Vanilla JavaScript, React, Next.js, Expo, and more.

There are also community SDKs for frameworks like Svelte, Vue, and Angular. See the Clerk documentation for the full list of integrated frameworks.

Add the Clerk token to your Triplit client
Your Triplit client needs to send the JWT token issued by Clerk with each request. You can do this with the startSession method for the TriplitClient. Here's an example with Clerk's React bindings:

import { useAuth } from '@clerk/clerk-react';
 
function App() {
  const { isLoaded, getToken } = useAuth();
 
  // Refresh the Triplit session when auth state changes
  useEffect(() => {
    if (isLoaded) {
      getToken().then((token) => {
        if (!token) {
          client.endSession();
          return;
        }
        client.startSession(token, true, {
          refreshHandler: getToken,
        });
      });
    }
  }, [getToken, isLoaded]);
}

You'll note that we're using the refreshHandler option to automatically refresh the token before it expires. Triplit will close down connections with expired tokens, but this will keep connections open for as long as Clerk issues a token that has consistent roles .

Test locally
Run you Triplit app and sign in with Clerk. If you’re setup correctly, you should see the connection is established and your data is syncing with your server. If you can't connect, ensure that you set the TRIPLIT_EXTERNAL_JWT_SECRET environmental variables correctly.

Configure your Triplit dashboard
To use Clerk with a deployed Triplit server, you just need ensure that it can use the Clerk public key to verify incoming requests.

If you're using the Triplit Dashboard, you can add the public key to the External JWT secret input in your project settings.

Triplit Project Settings

If you're using a custom self-hosted server, you need to set the EXTERNAL_JWT_SECRET environmental variable to the public key.

Now that you have a user auth system set up, you can add permissions to your Triplit schema. By default, the JWT issued by Clerk will set the sub claim to the authenticated user's unique identifier. The server will apply the default authenticated role the token. For a given collection, you can define a permission that only allows any authenticated user to read all posts but only mutate their own.

import { Schema as S } from '@triplit/client';
 
export const schema = S.Collections({
  posts: {
    schema: S.Schema({
      id: S.Id(),
      title: S.String(),
      content: S.String(),
      authorId: S.String(),
    }),
    permissions: {
      authenticated: {
        read: { filter: [true] },
        insert: { filter: [['authorId', '=', '$token.sub']] },
        update: { filter: [['authorId', '=', '$token.sub']] },
        delete: { filter: [['authorId', '=', '$token.sub']] },
      },
    },
  },
});

When creating posts, you should ensure that the authorId is set to the sub claim, either taken from the token or the Supabase session.

If you need to model more complex roles or permissions, consult the documentation.

Last

Local Development
Although you can connect directly to a managed or self hosted instance of a remote Triplit Database, you can also run a local instance of Triplit Database for development purposes. This not only helps separate your development and production environments, but Triplit's local development toolkit provides a lot of help for deploying updates to the Database. For this reason, we recommend running a local instance of Triplit Database when building most projects.

Install the CLI
If you haven't already, install the Triplit CLI and initialize a project. You can find instructions for doing so here.

Start Triplit services
To start Triplit services, run the following command in your project directory:

npx triplit dev
By default this will start the following services:

Triplit Console, running at https://console.triplit.dev/local
Triplit Database server, running at http://localhost:6543
And prints a usable Service Token and Anonymous Token for connecting to the database.

Additional environment variables
If your project has a .env file, you may set the following environment variables to configure the Triplit Database server:

If you're using a framework like Vite or Next.js you should add additional environmental variables prepended with VITE_ or NEXT_PUBLIC_ respectively for the DB_URL and ANONYMOUS_TOKEN. For example, TRIPLIT_DB_URL would become VITE_TRIPLIT_DB_URL or NEXT_PUBLIC_TRIPLIT_DB_URL.

TRIPLIT_SERVICE_TOKEN - The Service Token to use for connecting to the database for CLI commands. If not set, you may use a flag in the CLI (which takes precedent) or the CLI will prompt you for a key.
TRIPLIT_DB_URL - The URL to use for connecting to the database. If not set, you may use a flag in the CLI (which takes precedent) or use the default URL for the local database.
TRIPLIT_JWT_SECRET - Overrides the JWT secret used when generating local api tokens.
TRIPLIT_EXTERNAL_JWT_SECRET - Overrides the JWT secret used when generating external api tokens.
TRIPLIT_CLAIMS_PATH - A . separated path to read Triplit claims on external api tokens. If not set, claims are assumed to be at the root of the token.
TRIPLIT_MAX_BODY_SIZE - The maximum body size for incoming requests. This is useful if you want to send large payloads to your server. The default value is 100, corresponding to 100MB.
Last

Seeding a Triplit Database
In this guide, we'll walk through how to use triplit seed to seed a database.

Creating a seed file
First, we'll need to create a seed file. This is a file that contains the data we want to seed the database with. We'll use the triplit seed command to this file.

triplit seed create my-first-seed
This will create a file called my-first-seed.ts in the triplit/seeds directory. It will introspect your schema defined in ./triplit/schema.ts. It will use the schema to provide some initial type hinting to help ensure that the data in your seed adheres to the schema.

For example, a schema file might look like this:

./triplit/schema.ts
import { Schema as S } from '@triplit/client';
 
const schema = S.Collections({
  todos: {
    schema: S.Schema({
      id: S.Id(),
      text: S.String(),
      completed: S.Boolean({ default: false }),
      created_at: S.Date({ default: S.Default.now() }),
    }),
  },
  profiles: {
    schema: S.Schema({
      id: S.Id(),
      name: S.String(),
      created_at: S.Date({ default: S.Default.now() }),
    }),
  },
});

And would result in a seed file that looks like this:

triplit/seeds/my-first-seed.ts
import { BulkInsert } from '@triplit/client';
import { schema } from '../schema.js';
export default function seed(): BulkInsert<typeof schema> {
  return {
    todos: [],
    profiles: [],
  };
}

Editing the seed file
Now that we have scaffolded a seed file, we can start adding data to it. Let's add a few todos:

triplit/seeds/my-first-seed.ts
import { BulkInsert } from '@triplit/client';
import { schema } from '../schema.js';
export default function seed(): BulkInsert<typeof schema> {
  return {
    todos: [
      {
        text: 'Buy milk',
      },
      {
        text: 'Buy eggs',
      },
      {
        text: 'Buy bread',
      },
    ],
    profiles: [
      {
        name: 'Cole Cooper',
      },
    ],
  };
}

You can add whatever scripts you want to this file, including external libraries, as long as it exports a default function that adheres to the BulkInsert type (a record with collection names as keys and arrays of entities as values).

Using the seed file
Now that we have a seed file, we can use the triplit seed run command to seed the database. First, make sure that your environment variables are set up correctly, with TRIPLIT_DB_URL pointing to your database (be it a local dev server or a Triplit Cloud instance) and TRIPLIT_SERVICE_TOKEN set to a valid service token.

Then, run the triplit seed create command with the name of the seed file as an argument:

triplit seed run my-first-seed

You should see some output

> Running seed file: my-first-seed.ts
> Successfully seeded with my-seed.ts
> Inserted 3 document(s) into todos
> Inserted 1 document(s) into users
triplit seed variants
create
You can use the --create option to create a seed file with some helpful typescript. This will introspect your schema and provide some initial type hinting to help ensure that the data in your seed adheres to the schema.

triplit seed create my-first-seed

--all
You can define multiple seed files in the triplit/seeds directory. You can run them all at once by using the --all option.

triplit seed run --all

--file
You can also run a specific seed file, not necessarily located in triplit/seeds/[seed-file].ts by using the --file option.

triplit seed run path/to/my-seed.ts

Last

Server-side rendering
Triplit is designed to work in a client-side environment, but it can work in a server-side rendering (SSR) environment as well.

The HTTP client
When working with Triplit data in a server environment (e.g. to hydrate a pre-rendered page), the TriplitClient's default query and mutation methods will not work. They rely on establishing a sync connection over WebSockets, which is not possible in many stateless server-rendering environments. Instead, use the HttpClient, a stateless Triplit client that can perform operations on a remote Triplit server over HTTP. It is fully-typed and has a broadly similar API to the core Triplit Client.

server-action.ts
// This code runs on the server
import { HttpClient } from '@triplit/client';
import { PUBLIC_TRIPLIT_URL, PUBLIC_TRIPLIT_TOKEN } from '$env/static/public';
 
const httpClient = new HttpClient({
  serverUrl: PUBLIC_TRIPLIT_URL,
  token: PUBLIC_TRIPLIT_TOKEN,
});
 
const results = await httpClient.fetch(httpClient.query('allPosts'));
Client configuration
Though we recommend only using the HttpClient to fetch or mutate data in a server-rendering environment, a TriplitClient can be instantiated in code that runs on a server with some specific configuration. You will often want to do this if you have a single TriplitClient instance that is shared between server and client code.

WebSockets and auto-connect
By default, a new client attempts to open up a sync connection over WebSockets with the provided serverUrl and token. This auto-connecting behavior is controlled with the autoConnect client parameter. If you are instantiating a client in code that may run in an environment where WebSockets are not available (e.g. during server-side rendering), you should set autoConnect to false or preferably to an environmental variable that indicates whether the client should connect. Allowing the client to attempt to connect to the server over WebSockets in a server-side rendering environment will result in an error or undefined behavior.

Here's an example in SvelteKit:

src/lib/client.ts
import { TriplitClient } from '@triplit/client';
import { browser } from '$app/environment';
import { PUBLIC_TRIPLIT_URL, PUBLIC_TRIPLIT_TOKEN } from '$env/static/public';
 
export const client = new TriplitClient({
  serverUrl: PUBLIC_TRIPLIT_URL,
  token: PUBLIC_TRIPLIT_TOKEN,
  autoConnect: browser,
});
Storage
You may chose to use a storage provider like IndexedDB to provide a durable cache for your client. IndexedDB is not available in a server-side rendering environment, so you should use a different storage provider in that case. Attempting to use IndexedDB in a server-side rendering environment will result in an error or undefined behavior.

Continuing the SvelteKit example:

src/lib/client.ts
import { TriplitClient } from '@triplit/client';
import { browser } from '$app/environment';
import { PUBLIC_TRIPLIT_URL, PUBLIC_TRIPLIT_TOKEN } from '$env/static/public';
 
export const client = new TriplitClient({
  serverUrl: PUBLIC_TRIPLIT_URL,
  token: PUBLIC_TRIPLIT_TOKEN,
  autoConnect: browser,
  storage: browser ? 'indexeddb' : 'memory',
});
Looking ahead
In the future, we plan to provide a more robust solution for server-side rendering with Triplit. Keep an eye on our roadmap and Discord to stay updated.

Last

HTTP API
Overview
The HTTP API is a RESTful API that allows you to interact with a Triplit Cloud production server or the Triplit Node server that you can host yourself. It's useful if your client can't connect over WebSockets, or if your application wants to forgo the local cache and optimistic updates that the Triplit sync protocol provides. This can be useful for applications that need certainty about the state of the database, or for migrating data to Triplit from other services.

Authentication
The HTTP API, like the Triplit sync protocol, uses JSON Web Tokens (JWT) for authentication. If you're communicating with a Triplit Cloud production server, you'll need to use your project's Service or Anonymous Token from the Triplit Cloud dashboard for your project. If you're communicating with a Node server that you control, you'll need a properly formed JWT with the correct claims. Using the Triplit CLI and triplit dev command will automatically generate acceptable Service and Anonymous tokens for you.

With your token in hand, set up your HTTP client to send the token in the Authorization header with the Bearer scheme. Using the Fetch API, it would look like this:

// Request
await fetch('https://<project-id>.triplit.io/<route>', {
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
});
TriplitClient.http and HttpClient
Triplit provides helpful abstractions for interacting with the HTTP API. Read more about it in the Triplit Client documentation.

Routes
/fetch
Performs a fetch, returning the an array of entities that meet the query criteria.

// Request
await fetch('https://<project-id>.triplit.io/fetch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    query: {
      collectionName: 'todos',
      where: [['completed', '=', false]],
    },
  }),
});
 
// Response
[
  {
    id: '123',
    title: 'Buy milk',
    completed: false,
  },
  {
    id: '456',
    title: 'Buy eggs',
    completed: false,
  },
];
/insert
Inserts a single entity for a given collection.

// Request
await fetch('https://<project-id>.triplit.io/insert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    collectionName: 'todos',
    entity: {
      id: '123',
      title: 'Buy milk',
      completed: false,
    },
  }),
});
/bulk-insert
Inserts several entities at once that are provided as an object where the collection names are the keys and the list of entities for that collection are the values.

// Request
await fetch('https://<project-id>.triplit.io/bulk-insert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    todos: [
      {
        id: '123',
        title: 'Buy milk',
        completed: false,
      },
      {
        id: '456',
        title: 'Buy eggs',
        completed: false,
      },
    ],
  }),
});
/update
Updates a single entity for a given collection with a set of provided patches.

// Request
await fetch('https://<project-id>.triplit.io/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    collectionName: 'todos',
    entityId: '123',
    patches: [
      ['set', 'completed', true],
      ['set', 'title', 'Buy milk and eggs'],
    ],
  }),
});
/delete
Deletes a single entity for a given collection.

// Request
await fetch('https://<project-id>.triplit.io/delete', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    collectionName: 'todos',
    entityId: '123',
  }),
});
/delete-all
Deletes all entities for a given collection.

// Request
await fetch('https://<project-id>.triplit.io/delete-all', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + TRIPLIT_TOKEN,
  },
  body: JSON.stringify({
    collectionName: 'todos',
  }),
});
/healthcheck
This endpoint is publicly available (i.e. no authentication token is required) and will return a 200 status code if the server is running and healthy.