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

think about this

getText()
Returns the current editor document as plain text.

Parameter	Type	Description
options	blockSeparator?: string, textSerializers?: Record;string, TextSerializer	Options for the serialization.
// Give me plain text!
editor.getText()
// Add two line breaks between nodes
editor.getText({ blockSeparator: '\n\n' })

Inline commands
In some cases, it’s helpful to put some more logic in a command. That’s why you can execute commands in commands. I know, that sounds crazy, but let’s look at an example:

editor
  .chain()
  .focus()
  .command(({ tr }) => {
    // manipulate the transaction
    tr.insertText('hey, that’s cool!')

    return true
  })
  .run()

Nodes & Marks
Command	Description
clearNodes()	Normalize nodes to a simple paragraph.
createParagraphNear()	Create a paragraph nearby.
deleteNode()	Delete a node.
extendMarkRange()	Extends the text selection to the current mark.
exitCode()	Exit from a code block.
joinBackward()	Join two nodes backward.
joinForward()	Join two nodes forward.
lift()	Removes an existing wrap.
liftEmptyBlock()	Lift block if empty.
newlineInCode()	Add a newline character in code.
resetAttributes()	Resets some node or mark attributes to the default value.
setMark()	Add a mark with new attributes.
setNode()	Replace a given range with a node.
splitBlock()	Forks a new node from an existing node.
toggleMark()	Toggle a mark on and off.
toggleNode()	Toggle a node with another node.
toggleWrap()	Wraps nodes in another node, or removes an existing wrap.
undoInputRule()	Undo an input rule.
unsetAllMarks()	Remove all marks in the current selection.
unsetMark()	Remove a mark in the current selection.
updateAttributes()	Update attributes of a node or mark.
Lists
Command	Description
liftListItem()	Lift the list item into a wrapping list.
sinkListItem()	Sink the list item down into an inner list.
splitListItem()	Splits one list item into two list items.
toggleList()	Toggle between different list types.
wrapInList()	Wrap a node in a list.
Selection
Command	Description
blur()	Removes focus from the editor.
deleteRange()	Delete a given range.
deleteSelection()	Delete the selection, if there is one.
enter()	Trigger enter.
focus()	Focus the editor at the given position.
keyboardShortcut()	Trigger a keyboard shortcut.
scrollIntoView()	Scroll the selection into view.
selectAll()	Select the whole document.
selectNodeBackward()	Select a node backward.
selectNodeForward()	Select a node forward.
selectParentNode()	Select the parent node.
setNodeSelection()	Creates a NodeSelection.
setTextSelection()	Creates a TextSelection.
Write your own commands
All extensions can add additional commands (and most do), check out the specific documentation for the provided nodes, marks, and functionality to learn more about those. And of course, you can add your custom extensions with custom commands as well. But how do you write those commands? There’s a little bit to learn about that.
Use Cases
Initializing New Documents: Start fresh with the setContent command to initialize a clean document or predefined template.
Updating Existing Content: Use the insertContent or insertContentAt commands to add new content or update specific sections based on user interactions.
Clearing Content: Remove all content with the clearContent command while maintaining a valid document structure.
Managing User Selections: Insert or replace content at specific positions or ranges using insertContentAt according to user selections.
List of content commands
Command	Description
clearContent	Deletes the current document while adhering to the editor’s schema.
insertContent	Adds content to the document using plain text, HTML, or JSON.
insertContentAt	Inserts content at a specific position or range in the document.
setContent	Replaces the entire document with a new one using JSON or HTML.


insertContentAt command
The insertContentAt will insert an HTML string or a node at a given position or range. If a range is given, the new content will replace the content in the given range with the new content.

Parameters
position: number | Range

The position or range the content will be inserted in.

value: Content

The content to be inserted. Can be plain text, an HTML string or JSON node(s).

options: Record<string, any>

updateSelection: controls if the selection should be moved to the newly inserted content.
parseOptions: Passed content is parsed by ProseMirror. To hook into the parsing, you can pass parseOptions which are then handled by ProseMirror.
Use the insertContentAt command
// Plain text
editor.commands.insertContentAt(12, 'Example Text')

// Plain text, replacing a range
editor.commands.insertContentAt({ from: 12, to: 16 }, 'Example Text')

// HTML
editor.commands.insertContentAt(12, '<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContentAt(12, '<p>Hello world</p>', {
  updateSelection: true,
  parseOptions: {
    preserveWhitespace: 'full',
  },
})

// JSON/Nodes
editor.commands.insertContentAt(12, {
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],

  you can get the editor instance from the editor store then use editor.view.state.selection.from to get the current cursor/selection position. This is shown in the image upload guide where it's used to get the position for inserting images:

const pos = editor.view.state.selection.from;
think about this

getText()
Returns the current editor document as plain text.

Parameter	Type	Description
options	blockSeparator?: string, textSerializers?: Record;string, TextSerializer	Options for the serialization.
// Give me plain text!
editor.getText()
// Add two line breaks between nodes
editor.getText({ blockSeparator: '\n\n' })

Inline commands
In some cases, it’s helpful to put some more logic in a command. That’s why you can execute commands in commands. I know, that sounds crazy, but let’s look at an example:

editor
  .chain()
  .focus()
  .command(({ tr }) => {
    // manipulate the transaction
    tr.insertText('hey, that’s cool!')

    return true
  })
  .run()

Nodes & Marks
Command	Description
clearNodes()	Normalize nodes to a simple paragraph.
createParagraphNear()	Create a paragraph nearby.
deleteNode()	Delete a node.
extendMarkRange()	Extends the text selection to the current mark.
exitCode()	Exit from a code block.
joinBackward()	Join two nodes backward.
joinForward()	Join two nodes forward.
lift()	Removes an existing wrap.
liftEmptyBlock()	Lift block if empty.
newlineInCode()	Add a newline character in code.
resetAttributes()	Resets some node or mark attributes to the default value.
setMark()	Add a mark with new attributes.
setNode()	Replace a given range with a node.
splitBlock()	Forks a new node from an existing node.
toggleMark()	Toggle a mark on and off.
toggleNode()	Toggle a node with another node.
toggleWrap()	Wraps nodes in another node, or removes an existing wrap.
undoInputRule()	Undo an input rule.
unsetAllMarks()	Remove all marks in the current selection.
unsetMark()	Remove a mark in the current selection.
updateAttributes()	Update attributes of a node or mark.
Lists
Command	Description
liftListItem()	Lift the list item into a wrapping list.
sinkListItem()	Sink the list item down into an inner list.
splitListItem()	Splits one list item into two list items.
toggleList()	Toggle between different list types.
wrapInList()	Wrap a node in a list.
Selection
Command	Description
blur()	Removes focus from the editor.
deleteRange()	Delete a given range.
deleteSelection()	Delete the selection, if there is one.
enter()	Trigger enter.
focus()	Focus the editor at the given position.
keyboardShortcut()	Trigger a keyboard shortcut.
scrollIntoView()	Scroll the selection into view.
selectAll()	Select the whole document.
selectNodeBackward()	Select a node backward.
selectNodeForward()	Select a node forward.
selectParentNode()	Select the parent node.
setNodeSelection()	Creates a NodeSelection.
setTextSelection()	Creates a TextSelection.
Write your own commands
All extensions can add additional commands (and most do), check out the specific documentation for the provided nodes, marks, and functionality to learn more about those. And of course, you can add your custom extensions with custom commands as well. But how do you write those commands? There’s a little bit to learn about that.
Use Cases
Initializing New Documents: Start fresh with the setContent command to initialize a clean document or predefined template.
Updating Existing Content: Use the insertContent or insertContentAt commands to add new content or update specific sections based on user interactions.
Clearing Content: Remove all content with the clearContent command while maintaining a valid document structure.
Managing User Selections: Insert or replace content at specific positions or ranges using insertContentAt according to user selections.
List of content commands
Command	Description
clearContent	Deletes the current document while adhering to the editor’s schema.
insertContent	Adds content to the document using plain text, HTML, or JSON.
insertContentAt	Inserts content at a specific position or range in the document.
setContent	Replaces the entire document with a new one using JSON or HTML.


insertContentAt command
The insertContentAt will insert an HTML string or a node at a given position or range. If a range is given, the new content will replace the content in the given range with the new content.

Parameters
position: number | Range

The position or range the content will be inserted in.

value: Content

The content to be inserted. Can be plain text, an HTML string or JSON node(s).

options: Record<string, any>

updateSelection: controls if the selection should be moved to the newly inserted content.
parseOptions: Passed content is parsed by ProseMirror. To hook into the parsing, you can pass parseOptions which are then handled by ProseMirror.
Use the insertContentAt command
// Plain text
editor.commands.insertContentAt(12, 'Example Text')

// Plain text, replacing a range
editor.commands.insertContentAt({ from: 12, to: 16 }, 'Example Text')

// HTML
editor.commands.insertContentAt(12, '<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContentAt(12, '<p>Hello world</p>', {
  updateSelection: true,
  parseOptions: {
    preserveWhitespace: 'full',
  },
})

// JSON/Nodes
editor.commands.insertContentAt(12, {
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],

  you can get the editor instance from the editor store then use editor.view.state.selection.from to get the current cursor/selection position. This is shown in the image upload guide where it's used to get the position for inserting images:

const pos = editor.view.state.selection.from;


think about this

getText()
Returns the current editor document as plain text.

Parameter	Type	Description
options	blockSeparator?: string, textSerializers?: Record;string, TextSerializer	Options for the serialization.
// Give me plain text!
editor.getText()
// Add two line breaks between nodes
editor.getText({ blockSeparator: '\n\n' })

Inline commands
In some cases, it’s helpful to put some more logic in a command. That’s why you can execute commands in commands. I know, that sounds crazy, but let’s look at an example:

editor
  .chain()
  .focus()
  .command(({ tr }) => {
    // manipulate the transaction
    tr.insertText('hey, that’s cool!')

    return true
  })
  .run()

Nodes & Marks
Command	Description
clearNodes()	Normalize nodes to a simple paragraph.
createParagraphNear()	Create a paragraph nearby.
deleteNode()	Delete a node.
extendMarkRange()	Extends the text selection to the current mark.
exitCode()	Exit from a code block.
joinBackward()	Join two nodes backward.
joinForward()	Join two nodes forward.
lift()	Removes an existing wrap.
liftEmptyBlock()	Lift block if empty.
newlineInCode()	Add a newline character in code.
resetAttributes()	Resets some node or mark attributes to the default value.
setMark()	Add a mark with new attributes.
setNode()	Replace a given range with a node.
splitBlock()	Forks a new node from an existing node.
toggleMark()	Toggle a mark on and off.
toggleNode()	Toggle a node with another node.
toggleWrap()	Wraps nodes in another node, or removes an existing wrap.
undoInputRule()	Undo an input rule.
unsetAllMarks()	Remove all marks in the current selection.
unsetMark()	Remove a mark in the current selection.
updateAttributes()	Update attributes of a node or mark.
Lists
Command	Description
liftListItem()	Lift the list item into a wrapping list.
sinkListItem()	Sink the list item down into an inner list.
splitListItem()	Splits one list item into two list items.
toggleList()	Toggle between different list types.
wrapInList()	Wrap a node in a list.
Selection
Command	Description
blur()	Removes focus from the editor.
deleteRange()	Delete a given range.
deleteSelection()	Delete the selection, if there is one.
enter()	Trigger enter.
focus()	Focus the editor at the given position.
keyboardShortcut()	Trigger a keyboard shortcut.
scrollIntoView()	Scroll the selection into view.
selectAll()	Select the whole document.
selectNodeBackward()	Select a node backward.
selectNodeForward()	Select a node forward.
selectParentNode()	Select the parent node.
setNodeSelection()	Creates a NodeSelection.
setTextSelection()	Creates a TextSelection.
Write your own commands
All extensions can add additional commands (and most do), check out the specific documentation for the provided nodes, marks, and functionality to learn more about those. And of course, you can add your custom extensions with custom commands as well. But how do you write those commands? There’s a little bit to learn about that.

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website

Search
⌘
K
Sign up
Get started
Overview
Install

Configure
Styling

Extensions
Overview
Nodes

Marks

Functionality

Custom extensions

Core Concepts
Introduction
Extensions
Nodes and Marks
Schema
Keyboard shortcuts
Persistence
ProseMirror
Markdown
Introduction
Getting Started

Advanced Usage

Guides

Examples
API Reference

Glossary
API
Editor instance
Commands

Content

clearContent
cut
insertContent
insertContentAt
setContent
Nodes & Marks

Lists

Selection

forEach
selectTextblockEnd
selectTextblockStart
setMeta
Utilities

Node Positions
Resizable Node views
Events
Input Rules
Paste Rules
Resources
Guides
Pro license
Copy markdown

Ask AI
setContent command
The setContent command replaces the document with new content. You can pass JSON or HTML. It's basically the same as setting the content on initialization.

See also: insertContent, clearContent

Parameters
content
The new content as string (JSON or HTML), Fragment, or ProseMirror Node. The editor will only render what's allowed according to the schema.

options
Optional configuration object with the following properties:

parseOptions?: Record<string, any> Options to configure the parsing. Read more about parseOptions in the ProseMirror documentation.

errorOnInvalidContent?: boolean Whether to throw an error if the content is invalid.

emitUpdate?: boolean (true) Whether to emit an update event. Defaults to true (Note: This changed from false in v2).

Examples
// Plain text
editor.commands.setContent('Example Text')

// HTML
editor.commands.setContent('<p>Example Text</p>')

// JSON
editor.commands.setContent({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Example Text',
        },
      ],
    },
  ],
})

// With options
editor.commands.setContent('<p>Example Text</p>', {
  emitUpdate: false,
  parseOptions: {
    preserveWhitespace: 'full',
  },
  errorOnInvalidContent: true,
})

Previously
insertContentAt
Next up
Nodes & Marks
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
On this page
Introduction
Parameters
Examples
setContent command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website

Search
⌘
K
Sign up
Get started
Overview
Install

Configure
Styling

Extensions
Overview
Nodes

Marks

Functionality

Custom extensions

Core Concepts
Introduction
Extensions
Nodes and Marks
Schema
Keyboard shortcuts
Persistence
ProseMirror
Markdown
Introduction
Getting Started

Advanced Usage

Guides

Examples
API Reference

Glossary
API
Editor instance
Commands

Content

clearContent
cut
insertContent
insertContentAt
setContent
Nodes & Marks

Lists

Selection

forEach
selectTextblockEnd
selectTextblockStart
setMeta
Utilities

Node Positions
Resizable Node views
Events
Input Rules
Paste Rules
Resources
Guides
Pro license
Copy markdown

Ask AI
clearContent command
The clearContent command deletes the current document. The editor will maintain at least one empty paragraph due to schema requirements.

See also: setContent, insertContent

Parameters
emitUpdate?: boolean (true) Whether to emit an update event. Defaults to true (Note: This changed from false in v2).

Examples
// Clear content (emits update event by default)
editor.commands.clearContent()

// Clear content without emitting update
editor.commands.clearContent(false)

Previously
Content
Next up
cut
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
On this page
Introduction
Parameters
Examples
clearContent command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website

Search
⌘
K
Sign up
Get started
Overview
Install

Configure
Styling

Extensions
Overview
Nodes

Marks

Functionality

Custom extensions

Core Concepts
Introduction
Extensions
Nodes and Marks
Schema
Keyboard shortcuts
Persistence
ProseMirror
Markdown
Introduction
Getting Started

Advanced Usage

Guides

Examples
API Reference

Glossary
API
Editor instance
Commands

Content

clearContent
cut
insertContent
insertContentAt
setContent
Nodes & Marks

Lists

Selection

forEach
selectTextblockEnd
selectTextblockStart
setMeta
Utilities

Node Positions
Resizable Node views
Events
Input Rules
Paste Rules
Resources
Guides
Pro license
Copy markdown

Ask AI
cut command
This command cuts out content and places it into the given position.

See also: focus

Use the cut command
const from = editor.state.selection.from
const to = editor.state.selection.to

const endPos = editor.state.doc.nodeSize - 2

// Cut out content from range and put it at the end of the document
editor.commands.cut({ from, to }, endPos)

Previously
clearContent
Next up
insertContent
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
On this page
Introduction
Use the cut command
cut command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website

Search
⌘
K
Sign up
Get started
Overview
Install

Configure
Styling

Extensions
Overview
Nodes

Marks

Functionality

Custom extensions

Core Concepts
Introduction
Extensions
Nodes and Marks
Schema
Keyboard shortcuts
Persistence
ProseMirror
Markdown
Introduction
Getting Started

Advanced Usage

Guides

Examples
API Reference

Glossary
API
Editor instance
Commands

Content

clearContent
cut
insertContent
insertContentAt
setContent
Nodes & Marks

Lists

Selection

forEach
selectTextblockEnd
selectTextblockStart
setMeta
Utilities

Node Positions
Resizable Node views
Events
Input Rules
Paste Rules
Resources
Guides
Pro license
Copy markdown

Ask AI
insertContent command
The insertContent command adds the passed value to the document.

See also: setContent, clearContent

Parameters
value: Content

The command is pretty flexible and takes plain text, HTML or even JSON as a value.

Use the insertContent command
// Plain text
editor.commands.insertContent('Example Text')

// HTML
editor.commands.insertContent('<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContent('<h1>Example Text</h1>', {
  parseOptions: {
    preserveWhitespace: false,
  },
})

// JSON/Nodes
editor.commands.insertContent({
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],
})

// Multiple nodes at once
editor.commands.insertContent([
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'First paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Second paragraph',
      },
    ],
  },
])

Previously
cut
Next up
insertContentAt
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
On this page
Introduction
Parameters
Use the insertContent command
insertContent command | Tiptap Editor Docs

--------------------
Selection extension
Version
Downloads
The Selection extension adds a CSS class to the current selection when the editor is blurred. By default it adds .selection, but you can change that.

Note that it’s only a class, the styling is totally up to you. The usage example below has some CSS for that class.


Install
npm install @tiptap/extensions

And import it in your editor:

import { Editor } from '@tiptap/core'
import { Selection } from '@tiptap/extensions'

new Editor({
  extensions: [Selection],
})

Settings
className
The class that is applied to the current selection.

Default: 'selection'

Selection.configure({
  className: 'selection',
})

Source code
packages/extensions/selection/

Minimal Install
import { Editor } from '@tiptap/core'
import { Selection } from '@tiptap/extensions/selection'

new Editor({
  extensions: [Selection],
})

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website

Search
⌘
K
Sign up
Get started
Overview
Install

Configure
Styling

Extensions
Overview
Nodes

Marks

Functionality

Custom extensions

Core Concepts
Introduction
Extensions
Nodes and Marks
Schema
Keyboard shortcuts
Persistence
ProseMirror
Markdown
Introduction
Getting Started

Advanced Usage

Guides

Examples
API Reference

Glossary
API
Editor instance
Commands

Utilities

Node Positions
Resizable Node views
Events
Input Rules
Paste Rules
Resources
Guides
Pro license
Copy markdown

Ask AI
Tiptap Concepts
Explore the foundational elements of Tiptap's API, designed for intricate rich text editing based on ProseMirror's architecture.

Structure
ProseMirror works with a strict Schema, which defines the allowed structure of a document. A document is a tree of headings, paragraphs and other elements, called nodes. Marks can be attached to a node, e. g. to emphasize part of it. Commands change that document programmatically.

State
The document is stored in a state. Changes are applied as transactions to the state. The state has details about the current content, cursor position and selection. You can hook into events, for example to alter transactions before they get applied.

Content
The document is stored internally as a ProseMirror node, and can be retrieved as a Tiptap JSON object calling editor.getJSON().

Tiptap JSON is the recommended format for storing the document and working with it. Below is an example Tiptap JSON document:

{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "attrs": {
        "textAlign": "center"
      },
      "content": [
        { "type": "text", "text": "Hello, " },
        {
          "type": "text",
          "text": "world",
          "marks": [{ "type": "bold" }, { "type": "italic" }]
        },
        { "type": "text", "text": "!" }
      ]
    }
  ]
}

A Tiptap JSON document is a tree of nodes. Some nodes can have children, but only text nodes (those with type: 'text') can contain text. Text nodes and other inline nodes can have marks applied to them. Some nodes and marks can have attributes.

Extensions
Extensions add nodes, marks and/or functionalities to the editor. A lot of those extensions bound their commands to common keyboard shortcuts.

Vocabulary
ProseMirror has its own vocabulary and you’ll stumble upon all those words now and then. Here is a short overview of the most common words we use in the documentation.

Word	Description
Schema	Configures the structure your content can have.
Document	The actual content in your editor.
State	Everything to describe the current content and selection of your editor.
Transaction	A change to the state (updated selection, content, …)
Extension	Registers new functionality.
Node	A type of content, for example a heading or a paragraph.
Mark	Can be applied to nodes, for example for inline formatting.
Command	Execute an action inside the editor, that somehow changes the state.
Decoration	Styling on top of the document, for example to highlight mistakes.
Previously
Vue
Next up
Extensions
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
On this page
Introduction
Structure
State
Content
Extensions
Vocabulary


Position Utilities
Position utilities help you track and update positions in your editor as the document changes.

Creating a position
Use createMappablePosition to create a position instance.

// Create a position at offset 10
const position = editor.utils.createMappablePosition(10)

The createMappablePosition method returns a MappablePosition instance by default. If the Collaboration extension is active, it will return a CollaborationMappablePosition instance.

MappablePosition: Base class for tracking positions in standard editors
CollaborationMappablePosition: Extended class for tracking positions when collaboration is enabled.
Updating a position
Use getUpdatedPosition to update a position after a transaction. The position is updated to reflect changes in the document.

// Get the updated position after a transaction
const { position: updatedPosition, mapResult } = editor.utils.getUpdatedPosition(
  position,
  transaction,
)

// The updated position reflects the new location after the transaction
const newOffset = updatedPosition.position

The getUpdatedPosition method returns an object with the following properties:

position (MappablePosition): The updated position.
mapResult (MapResult | null): The result of the mapping operation, as a ProseMirror MapResult. It contains information about the operation, for example, to see if the position was deleted.


setTextSelection command
If you think of selection in the context of an editor, you’ll probably think of a text selection. With setTextSelection you can control that text selection and set it to a specified range or position.

See also: focus, setNodeSelection, deleteSelection, selectAll

Parameters
position: number | Range

Pass a number, or a Range, for example { from: 5, to: 10 }.

Use the setTextSelection command
// Set the cursor to the specified position
editor.commands.setTextSelection(10)

// Set the text selection to the specified range
editor.commands.setTextSelection({ from: 5, to: 10 })

deleteSelection command
The deleteSelection command in Tiptap targets and removes any nodes or content that are currently selected within the editor.

The deleteSelection command deletes the currently selected nodes. If no selection exists, nothing will be deleted.

Use the deleteSelection command
editor.commands.deleteSelection()

selectAll command
Selects the whole document at once.

Use the selectAll command
// Select the whole document
editor.commands.selectAll()

focus command
This command sets the focus back to the editor.

When a user clicks on a button outside the editor, the browser sets the focus to that button. In most scenarios you want to focus the editor then again. That’s why you’ll see that in basically every demo here.

See also: setTextSelection, blur

Parameters
position: 'start' | 'end' | 'all' | number | boolean | null (false)

By default, it’s restoring the cursor position (and text selection). Pass a position to move the cursor to.

options: { scrollIntoView: boolean }

Defines whether to scroll to the cursor when focusing. Defaults to true.

Use the focus command
// Set the focus to the editor
editor.commands.focus()

// Set the cursor to the first position
editor.commands.focus('start')

// Set the cursor to the last position
editor.commands.focus('end')

// Selects the whole document
editor.commands.focus('all')

// Set the cursor to position 10
editor.commands.focus(10)

Editor Instance API
The editor instance is a central building block of Tiptap. It does most of the heavy lifting of creating a working ProseMirror editor such as creating the EditorView, setting the initial EditorState and so on.

Settings
The Editor class accepts a bunch of settings. Here is a list of all available settings:

element
The element specifies the HTML element the editor will be binded to. The following code will integrate Tiptap with an element with the .element class:

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  element: document.querySelector('.element'),
  extensions: [StarterKit],
})

You can even initiate your editor before mounting it to an element. This is useful when your DOM is not yet available or in a server-side rendering environment. Just initialize the editor with null and mount it later.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  element: null,
  extensions: [StarterKit],
})

// Later in your code
editor.mount(document.querySelector('.element'))

extensions
It’s required to pass a list of extensions to the extensions property, even if you only want to allow paragraphs.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'

new Editor({
  // Use the default extensions
  extensions: [StarterKit],

  // … or use specific extensions
  extensions: [Document, Paragraph, Text],

  // … or both
  extensions: [StarterKit, Highlight],
})

content
With the content property you can provide the initial content for the editor. This can be HTML or JSON.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
})

editable
The editable property determines if users can write into the editor.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
  editable: false,
})

textDirection
The textDirection property sets the text direction for all content in the editor. This is useful for right-to-left (RTL) languages like Arabic and Hebrew, or for bidirectional text content.

Value	Description
'ltr'	Sets left-to-right direction for all content.
'rtl'	Sets right-to-left direction for all content.
'auto'	Automatically detects direction based on content.
undefined	No direction attribute is added (default).
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>مرحبا بك في Tiptap</p>`,
  extensions: [StarterKit],
  textDirection: 'auto',
})

You can also override direction for specific nodes using the setTextDirection and unsetTextDirection commands. See the commands documentation for more details.

autofocus
With autofocus you can force the cursor to jump in the editor on initialization.

Value	Description
start	Sets the focus to the beginning of the document.
end	Sets the focus to the end of the document.
all	Selects the whole document.
Number	Sets the focus to a specific position in the document.
true	Enables autofocus.
false	Disables autofocus.
null	Disables autofocus.
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
  autofocus: false,
})

enableInputRules
By default, Tiptap enables all input rules. With enableInputRules you can control that.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
  enableInputRules: false,
})

Alternatively you can allow only specific input rules.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit, Link],
  // pass an array of extensions or extension names
  // to allow only specific input rules
  enableInputRules: [Link, 'horizontalRule'],
})

enablePasteRules
By default, Tiptap enables all paste rules. With enablePasteRules you can control that.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
  enablePasteRules: false,
})

Alternatively you can allow only specific paste rules.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit, Link],
  // pass an array of extensions or extension names
  // to allow only specific paste rules
  enablePasteRules: [Link, 'horizontalRule'],
})

injectCSS
By default, Tiptap injects a little bit of CSS. With injectCSS you can disable that.

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
  injectCSS: false,
})

injectNonce
When you use a Content-Security-Policy with nonce, you can specify a nonce to be added to dynamically created elements. Here is an example:

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
  injectCSS: true,
  injectNonce: 'your-nonce-here',
})

editorProps
For advanced use cases, you can pass editorProps which will be handled by ProseMirror. You can use it to override various editor events or change editor DOM element attributes, for example to add some Tailwind classes. Here is an example:

new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#view.EditorProps
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
    transformPastedText(text) {
      return text.toUpperCase()
    },
  },
})

You can use that to hook into event handlers and pass - for example - a custom paste handler, too.

parseOptions
Passed content is parsed by ProseMirror. To hook into the parsing, you can pass parseOptions which are then handled by ProseMirror.

new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#model.ParseOptions
  parseOptions: {
    preserveWhitespace: 'full',
  },
})

Methods
The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor.

Don’t confuse methods with commands. Commands are used to change the state of editor (content, selection, and so on) and only return true or false.

can()
Check if a command or a command chain can be executed – without actually executing it. Can be very helpful to enable/disable or show/hide buttons.

// Returns `true` if the undo command can be executed
editor.can().undo()

chain()
Create a command chain to call multiple commands at once.

// Execute two commands at once
editor.chain().focus().toggleBold().run()

destroy()
Stops the editor instance and unbinds all events.

// Hasta la vista, baby!
editor.destroy()

getHTML()
Returns the current editor document as HTML

editor.getHTML()

getJSON()
Returns the current editor document as JSON.

editor.getJSON()

getText()
Returns the current editor document as plain text.

Parameter	Type	Description
options	blockSeparator?: string, textSerializers?: Record;string, TextSerializer	Options for the serialization.
// Give me plain text!
editor.getText()
// Add two line breaks between nodes
editor.getText({ blockSeparator: '\n\n' })

getAttributes()
Get attributes of the currently selected node or mark.

Parameter	Type	Description
typeOrName	string | NodeType | MarkType	Name of the node or mark
editor.getAttributes('link').href

isActive()
Returns if the currently selected node or mark is active.

Parameter	Type	Description
name	string | null	Name of the node or mark
attributes	Record<string, any>	Attributes of the node or mark
// Check if it’s a heading
editor.isActive('heading')
// Check if it’s a heading with a specific attribute value
editor.isActive('heading', { level: 2 })
// Check if it has a specific attribute value, doesn’t care what node/mark it is
editor.isActive({ textAlign: 'justify' })

mount()
Mount the editor to an element. This is useful when you want to mount the editor to an element that is not yet available in the DOM.

editor.mount(document.querySelector('.element'))

unmount()
Unmount the editor from an element. This is useful when you want to unmount the editor from an element, but later want to re-mount it to another element.

editor.unmount()

registerPlugin()
Register a ProseMirror plugin.

Parameter	Type	Description
plugin	Plugin	A ProseMirror plugin
handlePlugins?	(newPlugin: Plugin, plugins: Plugin[]) => Plugin[]	Control how to merge the plugin into the existing plugins
setOptions()
Update editor options.

Parameter	Type	Description
options	Partial<EditorOptions>	A list of options
// Add a class to an existing editor instance
editor.setOptions({
  editorProps: {
    attributes: {
      class: 'my-custom-class',
    },
  },
})

setEditable()
Update editable state of the editor.

Parameter	Type	Description
editable	boolean	true when the user should be able to write into the editor.
emitUpdate	boolean	Defaults to true. Determines whether onUpdate is triggered.
// Make the editor read-only
editor.setEditable(false)

unregisterPlugin()
Unregister a ProseMirror plugin.

Parameter	Type	Description
nameOrPluginKey	string | PluginKey	The plugins name
$node()
See the NodePos class.

Properties
isEditable
Returns whether the editor is editable or read-only.

editor.isEditable

isEmpty
Check if there is content.

editor.isEmpty

isFocused
Check if the editor is focused.

editor.isFocused

isDestroyed
Check if the editor is destroyed.

editor.isDestroyed

isCapturingTransaction
Check if the editor is capturing a transaction.

editor.isCapturingTransaction

Previously
Glossary
Next up
Commands


insertContentAt command
The insertContentAt will insert an HTML string or a node at a given position or range. If a range is given, the new content will replace the content in the given range with the new content.

Parameters
position: number | Range

The position or range the content will be inserted in.

value: Content

The content to be inserted. Can be plain text, an HTML string or JSON node(s).

options: Record<string, any>

updateSelection: controls if the selection should be moved to the newly inserted content.
parseOptions: Passed content is parsed by ProseMirror. To hook into the parsing, you can pass parseOptions which are then handled by ProseMirror.
Use the insertContentAt command
// Plain text
editor.commands.insertContentAt(12, 'Example Text')

// Plain text, replacing a range
editor.commands.insertContentAt({ from: 12, to: 16 }, 'Example Text')

// HTML
editor.commands.insertContentAt(12, '<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContentAt(12, '<p>Hello world</p>', {
  updateSelection: true,
  parseOptions: {
    preserveWhitespace: 'full',
  },
})

// JSON/Nodes
editor.commands.insertContentAt(12, {
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],
})

// Multiple nodes at once
editor.commands.insertContentAt(12, [
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'First paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Second paragraph',
      },
    ],
  },
])

