Create a new extension
You can build your own extensions from scratch and you know what? It’s the same syntax as for extending existing extension described above.

Create an extension
Extensions add new capabilities to Tiptap and you’ll read the word extension here very often, even for nodes and marks. But there are literal extensions. Those can’t add to the schema (like marks and nodes do), but can add functionality or change the behaviour of the editor.

A good example to learn from is probably TextAlign.

import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  // Your code goes here.
})

You can also use a callback function to create an extension. This is useful if you want to encapsulate the logic of your extension, for example when you want to define event handlers or other custom logic.

import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create(() => {
  // Define variables or functions to use inside your extension
  const customVariable = 'foo'

  function onCreate() {}
  function onUpdate() {}

  return {
    name: 'customExtension',
    onCreate,
    onUpdate,

    // Your code goes here.
  }
})

Read more about the Extension API.

Create a node
If you think of the document as a tree, then nodes are just a type of content in that tree. Good examples to learn from are Paragraph, Heading, or CodeBlock.

import { Node } from '@tiptap/core'

const CustomNode = Node.create({
  name: 'customNode',

  // Your code goes here.
})

You can also use a callback function to create a node. This is useful if you want to encapsulate the logic of your extension, for example when you want to define event handlers or other custom logic.

import { Node } from '@tiptap/core'

const CustomNode = Node.create(() => {
  // Define variables or functions to use inside your extension
  const customVariable = 'foo'

  function onCreate() {}
  function onUpdate() {}

  return {
    name: 'customNode',
    onCreate,
    onUpdate,

    // Your code goes here.
  }
})

Nodes don’t have to be blocks. They can also be rendered inline with the text, for example for @mentions.

Read more about the Node API.

Create a mark
One or multiple marks can be applied to nodes, for example to add inline formatting. Good examples to learn from are Bold, Italic and Highlight.

import { Mark } from '@tiptap/core'

const CustomMark = Mark.create({
  name: 'customMark',

  // Your code goes here.
})

You can also use a callback function to create a mark. This is useful if you want to encapsulate the logic of your extension, for example when you want to define event handlers or other custom logic.

import { Mark } from '@tiptap/core'

const CustomMark = Mark.create(() => {
  // Define variables or functions to use inside your extension
  const customVariable = 'foo'

  function onCreate() {}
  function onUpdate() {}

  return {
    name: 'customMark',
    onCreate,
    onUpdate,

    // Your code goes here.
  }
})

Read more about the Mark API.

Publish standalone extensions
If you want to create and publish your own extensions for Tiptap, you can use our CLI tool to bootstrap your project. Simply run npm init tiptap-extension and follow the instructions. The CLI will create a new folder with a pre-configured project for you including a build script running on Rollup.

If you want to test your extension locally, you can run npm link in the project folder and then npm link YOUR_EXTENSION in your project (for example a Vite app).

Share
When everything is working fine, don’t forget to share it with the community or in our awesome-tiptap repository.


Creating a Tiptap Extension: Best Practices and Common Pitfalls
Aribaskar-jb
Aribaskar-jb

Follow
3 min read
·
Jan 27, 2025
1




Press enter or click to view image in full size

Tiptap, built on ProseMirror, is a highly customizable editor framework. Extensions in Tiptap allow developers to define custom functionality, such as nodes, marks, or commands. However, creating robust and efficient extensions requires adherence to certain best practices while avoiding common pitfalls. This document serves as a guide.

Creating a Tiptap Extension
Step 1: Use the Tiptap CLI
Tiptap provides a CLI tool to streamline the creation of extensions. This ensures that the generated code is consistent with Tiptap’s best practices and saves development time.

Install the CLI
First, install the Tiptap CLI globally using npm:

npm install -g @tiptap/cli
Generate an Extension
To create a new extension, run the following command:

tiptap-cli create-extension CustomNode
This generates a boilerplate for your extension, including placeholders for lifecycle methods, schema definitions, and commands. You can then customize the generated code as needed.

Step 2: Customize the Extension
Below is an example of a customized extension that adds a custom node:

import { Node, mergeAttributes } from '@tiptap/core';

export const CustomNode = Node.create({
  name: 'customNode',
  group: 'block',
  content: 'inline*',
  addAttributes() {
    return {
      customAttr: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="customNode"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'customNode' }, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      insertCustomNode:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: 'customNode' });
        },
    };
  },
});
Step 3: Use the Extension in the Editor
Once the extension is created, include it in the editor configuration:

import { Editor } from '@tiptap/core';
import { CustomNode } from './CustomNode';

const editor = new Editor({
  content: '',
  extensions: [CustomNode],
});
Best Practices
1. Use ProseMirror Transactions Judiciously
Avoid invoking commands inside the update or create hooks. Doing so can create infinite loops or unexpected behaviors. Use these hooks to respond to editor state changes, but do not mutate the state directly within them.
What to Avoid:
update({ editor, tr }) {
 editor.commands.setNode('customNode'); // Avoid this!
}
Correct Approach: Use transactions (tr) from ProseMirror instead:
update({ state, tr }) {
  if (tr.docChanged) {
    // Safely handle document changes
  }
}
2. Leverage addProseMirrorPlugins
Tiptap provides addProseMirrorPlugins to integrate custom ProseMirror plugins. Use this method to extend the editor functionality without overloading Tiptap-specific hooks:

addProseMirrorPlugins() {
  return [
    new Plugin({
      props: {
        handleKeyDown(view, event) {
          if (event.key === 'Enter') {
            console.log('Enter pressed!');
            return true;
          }
          return false;
        },
      },
    }),
  ];
}
3. Use state.doc and state.tr for Direct Manipulations
ProseMirror’s state.doc and state.tr provide direct access to the editor's document and transaction. When manipulating content programmatically, prefer these over invoking Tiptap commands to avoid unintended consequences.

Get Aribaskar-jb’s stories in your inbox
Join Medium for free to get updates from this writer.

Enter your email
Subscribe
Example of safely setting attributes:

update({ state, tr }) {
  const pos = tr.selection.anchor;
  const node = state.doc.nodeAt(pos);

if (node && node.type.name === 'customNode') {
    const newAttrs = { ...node.attrs, updatedAttr: 'newValue' };
    tr.setNodeMarkup(pos, undefined, newAttrs);
  }
}
4. Define Explicit Groups and Content
When defining nodes, clearly specify their group and content to ensure compatibility with the schema. For example:

group: 'block',
content: 'inline*',
Common Pitfalls to Avoid
1. Infinite Loops in Transactions
Calling editor commands or creating new transactions inside hooks like update or transaction can lead to infinite loops. Always work with ProseMirror transactions (tr) directly.

2. Overloading addNodeView
Node views should be lightweight. Avoid complex logic or heavy computations in addNodeView.

What to Avoid:

addNodeView() {
  return ({ node }) => {
    // Avoid heavy DOM manipulations here.
  };
}
3. Ignoring Schema Constraints
Ensure your node or mark schema is compatible with the existing document structure. Misconfigured content or group properties can lead to schema validation errors.

References
ProseMirror Documentation
Tiptap Documentation
ProseMirror Guide to Transactions
Tiptap Extension Guide
Building custom extensions in Tiptap
By following these guidelines and avoiding common pitfalls, you can create powerful, efficient extensions in Tiptap while leveraging the capabilities of ProseMirror.

1


Placeholder extension
Version
Downloads
This extension provides placeholder support. Give your users an idea what they should write with a tiny hint. There is a handful of things to customize, if you feel like it.


Install
npm install @tiptap/extensions

Usage
import { Editor } from '@tiptap/core'
import { Placeholder } from '@tiptap/extensions'

new Editor({
  extensions: [
    Placeholder.configure({
      placeholder: 'Write something …',
    }),
  ],
})

Additional Setup
Placeholders are displayed with the help of CSS.

Display a Placeholder only for the first line in an empty editor.

.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

Display Placeholders on every new line.

.tiptap p.is-empty::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

Settings
emptyEditorClass
The added CSS class if the editor is empty.

Default: 'is-editor-empty'

Placeholder.configure({
  emptyEditorClass: 'is-editor-empty',
})

emptyNodeClass
The added CSS class if the node is empty.

Default: 'is-empty'

Placeholder.configure({
  emptyNodeClass: 'my-custom-is-empty-class',
})

placeholder
The placeholder text added as data-placeholder attribute.

Default: 'Write something …'

Placeholder.configure({
  placeholder: 'My Custom Placeholder',
})

You can even use a function to add placeholder depending on the node:

Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return 'What’s the title?'
    }

    return 'Can you add some further context?'
  },
})

showOnlyWhenEditable
Show decorations only when editor is editable.

Default: true

Placeholder.configure({
  showOnlyWhenEditable: false,
})

showOnlyCurrent
Show decorations only in currently selected node.

Default: true

Placeholder.configure({
  showOnlyCurrent: false,
})

includeChildren
Show decorations also for nested nodes.

Default: false

Placeholder.configure({
  includeChildren: true,
})

Source code
packages/extensions/src/placeholder

Minimal Install
import { Editor } from '@tiptap/core'
import { Placeholder } from '@tiptap/extensions/placeholder'

new Editor({
  extensions: [Placeholder],
})
