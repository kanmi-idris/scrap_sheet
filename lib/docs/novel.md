useEditor
Imperative API for interacting with the editor.

Your component must be a child of EditorRoot to use this hook.
const CustomComponent = ({ open, onOpenChange }: LinkSelectorProps) => {
  const { editor } = useEditor();
...
}

<EditorRoot>
  <CustomComponent/>
</EditorRoot>
​
Props
​
editor
Editor
All methods are available here Editor
Editor Bubble Item


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

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
Editor commands
The editor provides a ton of commands to programmatically add or change content or alter the selection. If you want to build your own editor you definitely want to learn more about them.

Execute a command
All available commands are accessible through an editor instance. Let’s say you want to make text bold when a user clicks on a button. That’s how that would look like:

editor.commands.setBold()

While that’s perfectly fine and does make the selected bold, you’d likely want to chain multiple commands in one run. Let’s have a look at how that works.

Chain commands
Most commands can be combined to one call. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

editor.chain().focus().toggleBold().run()

The .chain() is required to start a new chain and the .run() is needed to actually execute all the commands in between.

In the example above two different commands are executed at once. When a user clicks on a button outside of the content, the editor isn’t in focus anymore. That’s why you probably want to add a .focus() call to most of your commands. It brings back the focus to the editor, so the user can continue to type.

All chained commands are kind of queued up. They are combined to one single transaction. That means, the content is only updated once, also the update event is only triggered once.

Transaction mapping
By default Prosemirror does not support chaining which means that you need to update the positions between chained commands via Transaction mapping.

For example you want to chain a delete and insert command in one chain, you need to keep track of the position inside your chain commands. Here is an example:

// here we add two custom commands to the editor to demonstrate transaction mapping between two transaction steps
addCommands() {
  return {
    delete: () => ({ tr }) => {
      const { $from, $to } = tr.selection

      // here we use tr.mapping.map to map the position between transaction steps
      const from = tr.mapping.map($from.pos)
      const to = tr.mapping.map($to.pos)

      tr.delete(from, to)

      return true
    },
    insert: (content: string) => ({ tr }) => {
      const { $from } = tr.selection

      // here we use tr.mapping.map to map the position between transaction steps
      const pos = tr.mapping.map($from.pos)

      tr.insertText(content, pos)

      return true
    },
  }
}

Now you can do the following without insert inserting the content into the wrong position:

editor.chain().delete().insert('foo').run()

Chain inside custom commands
When chaining a command, the transaction is held back. If you want to chain commands inside your custom commands, you’ll need to use said transaction and add to it. Here is how you would do that:

addCommands() {
  return {
    customCommand: attributes => ({ chain }) => {
      // Doesn’t work:
      // return editor.chain() …

      // Does work:
      return chain()
        .insertContent('foo!')
        .insertContent('bar!')
        .run()
    },
  }
}

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

Dry run commands
Sometimes, you don’t want to actually run the commands, but only know if it would be possible to run commands, for example to show or hide buttons in a menu. That’s what we added .can() for. Everything coming after this method will be executed, without applying the changes to the document:

editor.can().toggleBold()

And you can use it together with .chain(), too. Here is an example which checks if it’s possible to apply all the commands:

editor.can().chain().toggleBold().toggleItalic().run()

Both calls would return true if it’s possible to apply the commands, and false in case it’s not.

In order to make that work with your custom commands, don’t forget to return true or false.

For some of your own commands, you probably want to work with the raw transaction. To make them work with .can() you should check if the transaction should be dispatched. Here is how you can create a simple .insertText() command:

export default (value) =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      tr.insertText(value)
    }

    return true
  }

If you’re just wrapping another Tiptap command, you don’t need to check that, we’ll do it for you.

addCommands() {
  return {
    bold: () => ({ commands }) => {
      return commands.toggleMark('bold')
    },
  }
}

If you’re just wrapping a plain ProseMirror command, you’ll need to pass dispatch anyway. Then there’s also no need to check it:

import { exitCode } from '@tiptap/pm/commands'

export default () =>
  ({ state, dispatch }) => {
    return exitCode(state, dispatch)
  }

Try commands
If you want to run a list of commands, but want only the first successful command to be applied, you can do this with the .first() method. This method runs one command after the other and stops at the first which returns true.

For example, the backspace key tries to undo an input rule first. If that was successful, it stops there. If no input rule has been applied and thus can’t be reverted, it runs the next command and deletes the selection, if there is one. Here is the simplified example:

editor.commands.first(({ commands }) => [
  () => commands.undoInputRule(),
  () => commands.deleteSelection(),
  // …
])

Inside of commands you can do the same thing:

export default () =>
  ({ commands }) => {
    return commands.first([
      () => commands.undoInputRule(),
      () => commands.deleteSelection(),
      // …
    ])
  }

List of commands
Have a look at all of the core commands listed below. They should give you a good first impression of what’s possible.

Content
Command	Description
clearContent()	Clear the whole document.
insertContent()	Insert a node or an HTML string at the current position.
insertContentAt()	Insert a node or an HTML string at a specific position.
setContent()	Replace the whole document with new content.
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

Previously
Editor instance
Next up
Content
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
Commands | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
Content Editor commands
Use these commands to dynamically insert, replace, or remove content in your editor. Initialize new documents, update existing ones, or manage user selections, these commands provide you with tools to handle content manipulation.

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
Previously
Commands
Next up
clearContent
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
Content commands | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
cut command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
clearContent command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
insertContent command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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

Previously
insertContent
Next up
setContent
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap


Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
setContent command | Tiptap Editor Docs

Tiptap Docs
3.x
Editor
Guides
Examples
UI Components
Website


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
Paste Rules
Paste rules are a powerful feature in Tiptap that allow you to automatically transform content as it is pasted into the editor. They can be used to create shortcuts for formatting, inserting content, or triggering commands based on specific patterns in pasted text.

What are paste rules?
Paste rules are pattern-based triggers that watch for specific text or content when it is pasted into the editor, and automatically transform it into something else. For example, pasting **bold** can automatically turn the text into bold formatting, or pasting an image URL can create an image node. Paste rules are especially useful for implementing Markdown-like shortcuts and improving the user experience when pasting content from external sources.

How do paste rules work in Tiptap?
Tiptap uses paste rules to provide many of its default shortcuts and behaviors for pasted content. Paste rules are defined as regular expressions or custom matchers that match pasted text. When the pattern is detected, the rule executes a transformation—such as applying a mark, inserting a node, or running a command.

Paste rules are typically registered inside extensions (nodes, marks, or generic extensions) using the addPasteRules() method. Tiptap provides helper functions like markPasteRule and nodePasteRule to simplify the creation of paste rules for marks and nodes.

Creating a paste rule in an extension
To add a custom paste rule, define the addPasteRules() method in your extension. This method should return an array of paste rules.

Example: Creating a highlight mark with a paste rule
import { Mark, markPasteRule } from '@tiptap/core'

const HighlightMark = Mark.create({
  name: 'highlight',

  addPasteRules() {
    return [
      markPasteRule({
        find: /(?:==)((?:[^=]+))(?:==)/g, // Matches ==highlight==
        type: this.type,
      }),
    ]
  },
})

Example: Creating a custom figure node with a paste rule
import { Node, nodePasteRule } from '@tiptap/core'

const FigureNode = Node.create({
  name: 'figure',

  addPasteRules() {
    return [
      nodePasteRule({
        find: /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g, // Matches ![alt](src "title")
        type: this.type,
        getAttributes: match => {
          const [, alt, src, title] = match
          return { src, alt, title }
        },
      }),
    ]
  },
})

Understanding markPasteRule and nodePasteRule
Tiptap provides two helper functions to simplify the creation of paste rules:

markPasteRule: For applying marks (like bold, italic, highlight) based on a pattern in pasted content.
nodePasteRule: For inserting or transforming nodes (like images, figures, custom blocks) based on a pattern in pasted content.
Both functions accept a configuration object with at least these properties:

find: A regular expression or matcher function to match the pasted pattern.
type: The mark or node type to apply/insert.
getAttributes (optional): A function to extract and return attributes from the regex match.
getContent (nodePasteRule only, optional): A function or value to provide the node's content.
Extracting information with getAttributes
The getAttributes function allows you to extract data from the matched input and pass it as attributes to the node or mark. This is especially useful for nodes like images or figures, where you want to capture values like src, alt, or title from the pasted content.

Example: Using getAttributes in a node paste rule
addPasteRules() {
  return [
    nodePasteRule({
      find: /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g, // Matches ![alt](src "title")
      type: this.type,
      getAttributes: match => {
        const [, alt, src, title] = match
        return { src, alt, title }
      },
    }),
  ]
},

In this example, when a user pastes something like ![Alt text](image.png "Optional title"), the paste rule extracts the alt, src, and title from the match and passes them as attributes to the node.

Example: Using getAttributes in a mark paste rule
addPasteRules() {
  return [
    markPasteRule({
      find: /\*\*([^*]+)\*\*/g, // Matches **bold**
      type: this.type,
      getAttributes: match => {
        // You can extract custom attributes here if needed
        return {}
      },
    }),
  ]
},

Tips
The match parameter in getAttributes is the result of the regular expression, so you can destructure it to get the captured groups.
You can use getAttributes to set any attributes your node or mark supports, such as href for links, src for images, or custom data fields.
If you don’t need to extract attributes, you can omit getAttributes.
Use the g (global) flag in your regex to match all occurrences in the pasted content.
Previously
Input Rules
Next up
Guides
Edit this page on GitHub
Was this page helpful?


Hocuspocus
Legal notice
Privacy Policy
Terms of Service
Contributing
Changelog
Copyright © 2025 Tiptap
Paste Rules in Tiptap | Tiptap Editor Docs

# Editor Root

> A wrapper component for the editor. It provides a consistent layout and styling for the editor.

<Info>
  This example demonstrates the use of Shadcn-ui for ui, but alternative libraries and components
  can also be employed.
</Info>

```tsx
<EditorRoot>{...}</EditorRoot>
```

## Props

<ParamField required path="children" type="ReactNode">
  A ReactNode that represents the content of the editor.
</ParamField>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Editor Content

> Wrapper for Tiptap Provider 

For all the available props, see [Tiptap Settings](https://tiptap.dev/docs/editor/api/editor#settings).

```tsx
<EditorRoot>
  <EditorContent>{children}</EditorContent>
</EditorRoot>
```

## Props

<ParamField required path="children" type="ReactNode">
  A ReactNode that represents the content of the editor.
</ParamField>

<ParamField path="extensions" type="Extension[]" required>
  An array of Tiptap extensions to be used in the editor.
</ParamField>

<ParamField path="initialContent" type="JSONContent">
  Initial editor content in JSON format. [Tiptap
  Output](https://tiptap.dev/docs/editor/guide/output)
</ParamField>

<ParamField
  path="onUpdate"
  type="(props: {
  editor: Editor;
  transaction: Transaction;
  }) => void"
>
  Function that is called when the editor content is updated.
</ParamField>

<ParamField
  path="onCreate"
  type="onCreate?: (props: {
  editor: Editor;
  }) => void"
>
  Function that is called when the editor is created.
</ParamField>

<ParamField path="className" type="string">
  Classname for the parent container.
</ParamField>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt


# Editor Command

> Wrapper for Command Items using cmdk

For all the available props, see [cmdk](https://github.com/pacocoursey/cmdk).

```tsx
<EditorCommand>
  <EditorCommandItem />
  <EditorCommandItem />
  <EditorCommandItem />
</EditorCommand>
```

## Props

<ParamField required path="children" type="ReactNode" />

<ParamField path="className" type="string" />


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: 

# Novel Docs

## Docs

- [Editor Bubble](https://novel.mintlify.dev/docs/components/editor-bubble.md): Wrapper over Tiptap Bubble menu
- [Editor Bubble Item](https://novel.mintlify.dev/docs/components/editor-bubble-item.md): Bubble Item
- [Editor Command](https://novel.mintlify.dev/docs/components/editor-command.md): Wrapper for Command Items using cmdk
- [Editor Command Item](https://novel.mintlify.dev/docs/components/editor-command-item.md): Command Item
- [Editor Content](https://novel.mintlify.dev/docs/components/editor-content.md): Wrapper for Tiptap Provider 
- [Editor Root](https://novel.mintlify.dev/docs/components/editor-root.md): A wrapper component for the editor. It provides a consistent layout and styling for the editor.
- [useEditor](https://novel.mintlify.dev/docs/components/utils/use-editor.md): Imperative API for interacting with the editor.
- [Development](https://novel.mintlify.dev/docs/development.md): Learn how to contribute to Novel
- [AI Command (Soon)](https://novel.mintlify.dev/docs/guides/ai-command.md): Run AI commands in your editor
- [Global Drag Handle (New)](https://novel.mintlify.dev/docs/guides/global-drag-handle.md): Drag and drop blocks across the editor
- [Image Upload (New)](https://novel.mintlify.dev/docs/guides/image-upload.md): Uploading images in the editor
- [Overview](https://novel.mintlify.dev/docs/guides/overview.md): Use Novel with your favorite styling or components
- [Bubble Menu](https://novel.mintlify.dev/docs/guides/tailwind/bubble-menu.md): Showcase of the Bubble Menu component in various configurations.
- [Extensions](https://novel.mintlify.dev/docs/guides/tailwind/extensions.md): Styled and configured Tiptap extensions for your editor
- [Setup](https://novel.mintlify.dev/docs/guides/tailwind/setup.md): Follow this guide to set up Novel with Tailwindcss
- [Slash Command](https://novel.mintlify.dev/docs/guides/tailwind/slash-command.md): Create a slash command to insert content into the editor.
- [Introduction](https://novel.mintlify.dev/docs/introduction.md): Novel is a headless Notion-style WYSIWYG editor
- [Quickstart](https://novel.mintlify.dev/docs/quickstart.md): Start using the editor in 5 minutes


## Optional

- [Github](https://github.com/steven-tey/novel)


# Quickstart

> Start using the editor in 5 minutes

## Installation

Novel package doeesn't have any styles included. It's just a collection of custom configs and components for Tiptap.

<CodeGroup>
  ```bash npm
  npm i novel
  ```

  ```bash yarn
  yarn add novel
  ```

  ```bash pnpm
  pnpm add novel
  ```
</CodeGroup>

## Usage

<CardGroup>
  <Card
    title="Tailwind"
    icon={
       <svg className='h-8 w-8' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 54 33">
           <g clipPath="url(#prefix__clip0)">
               <path fill="#38bdf8" fillRule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" />
           </g>
           <defs>
               <clipPath id="prefix__clip0">
                   <path fill="#fff" d="M0 0h54v32.4H0z"/>
               </clipPath>
           </defs>
       </svg>
    }
    href="/guides/tailwind"
  >
    Usage with Tailwind and Shadcn-UI
  </Card>

  <Card icon="react" href="/components" title="Custom">
    Write your own styles using the Novel components
  </Card>
</CardGroup>

## Anatomy

This is mostly how you would use the editor in your application. Similar to Radix Primitives, Novel exports a set of components that you can use to build your own editor.

```tsx
import {
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandItem,
  EditorContent,
  EditorRoot,
} from "novel";

export default () => (
  <EditorRoot>
    <EditorContent>
      <EditorCommand>
        <EditorCommandItem />
        <EditorCommandItem />
        <EditorCommandItem />
      </EditorCommand>
      <EditorBubble>
        <EditorBubbleItem />
        <EditorBubbleItem />
        <EditorBubbleItem />
      </EditorBubble>
    </EditorContent>
  </EditorRoot>
);
```


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Editor Bubble

> Wrapper over Tiptap Bubble menu

For all the available props, see [Bubble Menu](https://tiptap.dev/docs/editor/api/extensions/bubble-menu).

```tsx
<EditorBubble>
  <EditorBubbleItem />
  <EditorBubbleItem />
  <EditorBubbleItem />
</EditorBubble>
```

## Props

<ParamField required path="children" type="ReactNode" />

<ParamField path="className" type="string" />

<ParamField path="tippyOptions" type="Props" />


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Editor Bubble Item

> Bubble Item

```tsx
<EditorBubbleItem
  key={index}
  onSelect={(editor) => {
    item.command(editor);
  }}>
  ...
</EditorBubbleItem>
```

## Props

<ParamField required path="children" type="ReactNode" />

<ParamField path="className" type="string" />

<ParamField path="onSelect" type="(editor: Editor) => void" />


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt
# Editor Command

> Wrapper for Command Items using cmdk

For all the available props, see [cmdk](https://github.com/pacocoursey/cmdk).

```tsx
<EditorCommand>
  <EditorCommandItem />
  <EditorCommandItem />
  <EditorCommandItem />
</EditorCommand>
```

## Props

<ParamField required path="children" type="ReactNode" />

<ParamField path="className" type="string" />


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Editor Command Item

> Command Item

For all the available props, see [cmdk](https://github.com/pacocoursey/cmdk).

```tsx
  ...
  <EditorCommandItem
    value={item.title}
    onCommand={(val) => item.command(val)}>
    Do something
  </EditorCommand>
```

## Props

<ParamField required path="children" type="ReactNode" />

<ParamField required path="value" type="string">
  This value would be used for filtering
</ParamField>

<ParamField required path="onCommand" type="({ editor, range }: { editor: Editor; range: Range }) => void;">
  Callback function onSelect exposing editor and range
</ParamField>

<ParamField path="className" type="string" />


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Editor Content

> Wrapper for Tiptap Provider 

For all the available props, see [Tiptap Settings](https://tiptap.dev/docs/editor/api/editor#settings).

```tsx
<EditorRoot>
  <EditorContent>{children}</EditorContent>
</EditorRoot>
```

## Props

<ParamField required path="children" type="ReactNode">
  A ReactNode that represents the content of the editor.
</ParamField>

<ParamField path="extensions" type="Extension[]" required>
  An array of Tiptap extensions to be used in the editor.
</ParamField>

<ParamField path="initialContent" type="JSONContent">
  Initial editor content in JSON format. [Tiptap
  Output](https://tiptap.dev/docs/editor/guide/output)
</ParamField>

<ParamField
  path="onUpdate"
  type="(props: {
  editor: Editor;
  transaction: Transaction;
  }) => void"
>
  Function that is called when the editor content is updated.
</ParamField>

<ParamField
  path="onCreate"
  type="onCreate?: (props: {
  editor: Editor;
  }) => void"
>
  Function that is called when the editor is created.
</ParamField>

<ParamField path="className" type="string">
  Classname for the parent container.
</ParamField>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Editor Root

> A wrapper component for the editor. It provides a consistent layout and styling for the editor.

<Info>
  This example demonstrates the use of Shadcn-ui for ui, but alternative libraries and components
  can also be employed.
</Info>

```tsx
<EditorRoot>{...}</EditorRoot>
```

## Props

<ParamField required path="children" type="ReactNode">
  A ReactNode that represents the content of the editor.
</ParamField>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# useEditor

> Imperative API for interacting with the editor.

Your component must be a child of `EditorRoot` to use this hook.

```tsx
const CustomComponent = ({ open, onOpenChange }: LinkSelectorProps) => {
  const { editor } = useEditor();
...
}

<EditorRoot>
  <CustomComponent/>
</EditorRoot>
```

## Props

<ParamField path="editor" type="Editor">
  All methods are available here [Editor](https://tiptap.dev/docs/editor/api/editor)
</ParamField>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Development

> Learn how to contribute to Novel

<Info>**Prerequisite** You should have installed Node.js (version 18.10.0 or higher).</Info>

## Introduction

Novel's codebase is set up in a monorepo (via [Turborepo](https://turbo.build/repo)) and is fully [open-source on GitHub](https://github.com/steven-tey/novel).

Here's the monorepo structure:

```
apps
├── docs
├── web
packages
├── headless
├── tailwind-config
```

### Step 1: Local setup

First, clone the [Novel repo](https://novel.sh/github)

```bash
git clone https://github.com/steven-tey/novel
```

Run the following command to install the dependencies:

```bash
pnpm i
```

Install Mintlify CLI (for docs server):

```bash
pnpm i -g mintlify
```

### Step 2: Start the development server

Finally, you can start the development server. This will build the packages + start the app servers.

```bash
pnpm dev
```

### Step 3: Use Generative AI Local (Optional)

You can use Ollama to run your local AI server.\
[https://ollama.com/blog/openai-compatibility](https://ollama.com/blog/openai-compatibility)

```bash
# You cand find the config in the web app
/api/generate/route.ts
```


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Global Drag Handle (New)

> Drag and drop blocks across the editor

<Steps>
  <Step title="Install the extension">
    Install the extension with a package manager of your choice.

    ```NPM
    $ npm i tiptap-extension-global-drag-handle
    ```

    ```Yarn
    $ yarn add tiptap-extension-global-drag-handle
    ```

    In order to enjoy all the advantages of a drag handle, it is recommended to install the auto joiner extension as well, which allows you to automatically join various nodes such as 2 lists that are next to each other.

    ```NPM
    $ npm i tiptap-extension-auto-joiner
    ```

    ```Yarn
    $ yarn add tiptap-extension-auto-joiner
    ```
  </Step>

  <Step title="Add drag extension">
    ```tsx
    // extensions.ts
    import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
    import AutoJoiner from 'tiptap-extension-auto-joiner' // optional

    export const defaultExtensions = [
        GlobalDragHandle,
        AutoJoiner, // optional
        // other extensions
    ];

    // editor.tsx
    const Editor = () => {
        return <EditorContent extensions={defaultExtensions} />
    }
    ```
  </Step>

  <Step title="Configure the extension">
    ```tsx
    //extensions.ts
    import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
    import AutoJoiner from 'tiptap-extension-auto-joiner' // optional

    export const defaultExtensions = [
        GlobalDragHandle.configure({
            dragHandleWidth: 20,    // default

            // The scrollTreshold specifies how close the user must drag an element to the edge of the lower/upper screen for automatic 
            // scrolling to take place. For example, scrollTreshold = 100 means that scrolling starts automatically when the user drags an 
            // element to a position that is max. 99px away from the edge of the screen
            // You can set this to 0 to prevent auto scrolling caused by this extension
            scrollTreshold: 100     // default
        }),
        AutoJoiner.configure({
            elementsToJoin: ["bulletList", "orderedList"] // default
        }),
        // other extensions
    ];

    // editor.tsx
    const Editor = () => {
        return <EditorContent extensions={defaultExtensions} />
    }
    ```
  </Step>

  <Step title="Add styling">
    By default the drag handle is headless, which means it doesn't contain any css. If you want to apply styling to the drag handle, use the class "drag-handle" in your css file.

    Take a look at [this](https://github.com/steven-tey/novel/blob/main/apps/web/styles/prosemirror.css#L131) to see an example of drag handle styling.
  </Step>
</Steps>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Image Upload (New)

> Uploading images in the editor

<Steps>
  <Step title="Add image extension">
    Configure image extension with your styling. The `imageClass` is used for styling the placeholder image.

    ```tsx
    //extensions.ts
    import { UploadImagesPlugin } from "novel/plugins";

    const tiptapImage = TiptapImage.extend({
        addProseMirrorPlugins() {
            return [
                UploadImagesPlugin({
                    imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
                }),
            ];
        },
        }).configure({
        allowBase64: true,
        HTMLAttributes: {
            class: cx("rounded-lg border border-muted"),
        },
    });

    export const defaultExtensions = [
        tiptapImage,
        //other extensions
    ];

    //editor.tsx
    const Editor = () => {
        return <EditorContent extensions={defaultExtensions} />
    }

    ```
  </Step>

  <Step title="Create upload function">
    `onUpload` should return a `Promise<string>`
    `validateFn` is triggered before an image is uploaded. It should return a `boolean` value.

    ```tsx image-upload.ts
    import { createImageUpload } from "novel/plugins";
    import { toast } from "sonner";

    const onUpload = async (file: File) => {
        const promise = fetch("/api/upload", {
            method: "POST",
            headers: {
            "content-type": file?.type || "application/octet-stream",
            "x-vercel-filename": file?.name || "image.png",
            },
            body: file,
        });

        //This should return a src of the uploaded image
        return promise;
    };

    export const uploadFn = createImageUpload({
        onUpload,
        validateFn: (file) => {
            if (!file.type.includes("image/")) {
                toast.error("File type not supported.");
                return false;
            } else if (file.size / 1024 / 1024 > 20) {
                toast.error("File size too big (max 20MB).");
                return false;
            }
            return true;
        },
    });

    ```
  </Step>

  <Step title="Configure events callbacks">
    This is required to handle image paste and drop events in the editor.

    ```tsx editor.tsx
    import { handleImageDrop, handleImagePaste } from "novel/plugins";
    import { uploadFn } from "./image-upload";

    ...
    <EditorContent
            editorProps={{
                handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
                handleDrop: (view, event, _slice, moved) =>  handleImageDrop(view, event, moved, uploadFn),
                ...
            }}
    />
    ...
    ```
  </Step>

  <Step title="Update slash-command suggestionsItems">
    ```tsx
    import { ImageIcon } from "lucide-react";
    import { createSuggestionItems } from "novel/extensions";
    import { uploadFn } from "./image-upload";

    export const suggestionItems = createSuggestionItems([
        ...,
        {
            title: "Image",
            description: "Upload an image from your computer.",
            searchTerms: ["photo", "picture", "media"],
            icon: <ImageIcon size={18} />,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run();
                // upload image
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {
                    if (input.files?.length) {
                    const file = input.files[0];
                    const pos = editor.view.state.selection.from;
                    uploadFn(file, editor.view, pos);
                    }
                };
                input.click();
            },
        }
     ])
    ```
  </Step>
</Steps>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Overview

> Use Novel with your favorite styling or components

## Active integrations

<Card
  title="Tailwind"
  icon={
     <svg className='h-8 w-8' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 54 33">
         <g clipPath="url(#prefix__clip0)">
             <path fill="#38bdf8" fillRule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" />
         </g>
         <defs>
             <clipPath id="prefix__clip0">
                 <path fill="#fff" d="M0 0h54v32.4H0z"/>
             </clipPath>
         </defs>
     </svg>
  }
  href="/guides/tailwind"
>
  Usage with Tailwind
</Card>

## Upcoming integrations

We are working on having more guides in the futures:

<Card>
  <b>CSS</b>
</Card>

<Card href="https://panda-css.com/">
  <b>Panda CSS</b>
</Card>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Bubble Menu

> Showcase of the Bubble Menu component in various configurations.

<img className="block dark:hidden" src="https://mintlify.s3-us-west-1.amazonaws.com/novel/images/bubble-light.png" alt="Hero Dark" />

<img className="hidden dark:block" src="https://mintlify.s3-us-west-1.amazonaws.com/novel/images/bubble-dark.png" alt="Hero Dark" />

We first have to create the selectors for the different types of nodes and links. We can then use these selectors to create the bubble menu.

<AccordionGroup>
  <Accordion title="Node Selector" icon="share-nodes">
    ```tsx node-selector.tsx
    import {
      Check,
      ChevronDown,
      Heading1,
      Heading2,
      Heading3,
      TextQuote,
      ListOrdered,
      TextIcon,
      Code,
      CheckSquare,
      type LucideIcon,
    } from "lucide-react";
    import { EditorBubbleItem, useEditor } from "novel";

    import { Popover } from "@radix-ui/react-popover";
    import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Button } from "@/components/ui/button";

    export type SelectorItem = {
      name: string;
      icon: LucideIcon;
      command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
      isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
    };

    const items: SelectorItem[] = [
      {
        name: "Text",
        icon: TextIcon,
        command: (editor) => editor.chain().focus().toggleNode("paragraph", "paragraph").run(),
        // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
        isActive: (editor) =>
          editor.isActive("paragraph") &&
          !editor.isActive("bulletList") &&
          !editor.isActive("orderedList"),
      },
      {
        name: "Heading 1",
        icon: Heading1,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: (editor) => editor.isActive("heading", { level: 1 }),
      },
      {
        name: "Heading 2",
        icon: Heading2,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (editor) => editor.isActive("heading", { level: 2 }),
      },
      {
        name: "Heading 3",
        icon: Heading3,
        command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (editor) => editor.isActive("heading", { level: 3 }),
      },
      {
        name: "To-do List",
        icon: CheckSquare,
        command: (editor) => editor.chain().focus().toggleTaskList().run(),
        isActive: (editor) => editor.isActive("taskItem"),
      },
      {
        name: "Bullet List",
        icon: ListOrdered,
        command: (editor) => editor.chain().focus().toggleBulletList().run(),
        isActive: (editor) => editor.isActive("bulletList"),
      },
      {
        name: "Numbered List",
        icon: ListOrdered,
        command: (editor) => editor.chain().focus().toggleOrderedList().run(),
        isActive: (editor) => editor.isActive("orderedList"),
      },
      {
        name: "Quote",
        icon: TextQuote,
        command: (editor) =>
          editor.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
        isActive: (editor) => editor.isActive("blockquote"),
      },
      {
        name: "Code",
        icon: Code,
        command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        isActive: (editor) => editor.isActive("codeBlock"),
      },
    ];
    interface NodeSelectorProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }

    export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
      const { editor } = useEditor();
      if (!editor) return null;
      const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
        name: "Multiple",
      };

      return (
        <Popover modal={true} open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger
            asChild
            className='gap-2 rounded-none border-none hover:bg-accent focus:ring-0'>
            <Button variant='ghost' className='gap-2'>
              <span className='whitespace-nowrap text-sm'>{activeItem.name}</span>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent sideOffset={5} align='start' className='w-48 p-1'>
            {items.map((item, index) => (
              <EditorBubbleItem
                key={index}
                onSelect={(editor) => {
                  item.command(editor);
                  onOpenChange(false);
                }}
                className='flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent'>
                <div className='flex items-center space-x-2'>
                  <div className='rounded-sm border p-1'>
                    <item.icon className='h-3 w-3' />
                  </div>
                  <span>{item.name}</span>
                </div>
                {activeItem.name === item.name && <Check className='h-4 w-4' />}
              </EditorBubbleItem>
            ))}
          </PopoverContent>
        </Popover>
      );
    };
    ```
  </Accordion>

  <Accordion title="Link Selector" icon="link">
    ```tsx link-selector.tsx
    import { cn } from "@/lib/utils";
    import { useEditor } from "novel";
    import { Check, Trash } from "lucide-react";
    import { type Dispatch, type FC, type SetStateAction, useEffect, useRef } from "react";
    import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
    import { Button } from "@/components/tailwind/ui/button";
    import { PopoverContent } from "@/components/tailwind/ui/popover";

    export function isValidUrl(url: string) {
      try {
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    }
    export function getUrlFromString(str: string) {
      if (isValidUrl(str)) return str;
      try {
        if (str.includes(".") && !str.includes(" ")) {
          return new URL(`https://${str}`).toString();
        }
      } catch (e) {
        return null;
      }
    }
    interface LinkSelectorProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }

    export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
      const inputRef = useRef<HTMLInputElement>(null);
      const { editor } = useEditor();

      // Autofocus on input by default
      useEffect(() => {
        inputRef.current && inputRef.current?.focus();
      });
      if (!editor) return null;

      return (
        <Popover modal={true} open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button variant='ghost' className='gap-2 rounded-none border-none'>
              <p className='text-base'>↗</p>
              <p
                className={cn("underline decoration-stone-400 underline-offset-4", {
                  "text-blue-500": editor.isActive("link"),
                })}>
                Link
              </p>
            </Button>
          </PopoverTrigger>
          <PopoverContent align='start' className='w-60 p-0' sideOffset={10}>
            <form
              onSubmit={(e) => {
                const target = e.currentTarget as HTMLFormElement;
                e.preventDefault();
                const input = target[0] as HTMLInputElement;
                const url = getUrlFromString(input.value);
                url && editor.chain().focus().setLink({ href: url }).run();
              }}
              className='flex  p-1 '>
              <input
                ref={inputRef}
                type='text'
                placeholder='Paste a link'
                className='flex-1 bg-background p-1 text-sm outline-none'
                defaultValue={editor.getAttributes("link").href || ""}
              />
              {editor.getAttributes("link").href ? (
                <Button
                  size='icon'
                  variant='outline'
                  type='button'
                  className='flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800'
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                  }}>
                  <Trash className='h-4 w-4' />
                </Button>
              ) : (
                <Button size='icon' className='h-8'>
                  <Check className='h-4 w-4' />
                </Button>
              )}
            </form>
          </PopoverContent>
        </Popover>
      );
    };
    ```
  </Accordion>

  <Accordion title="Text Buttons" icon="bold">
    ```tsx text-buttons.tsx
    import { cn } from "@/lib/utils";
    import { EditorBubbleItem, useEditor } from "novel";
    import { BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon, CodeIcon } from "lucide-react";
    import type { SelectorItem } from "./node-selector";
    import { Button } from "@/components/tailwind/ui/button";

    export const TextButtons = () => {
      const { editor } = useEditor();
      if (!editor) return null;
      const items: SelectorItem[] = [
        {
          name: "bold",
          isActive: (editor) => editor.isActive("bold"),
          command: (editor) => editor.chain().focus().toggleBold().run(),
          icon: BoldIcon,
        },
        {
          name: "italic",
          isActive: (editor) => editor.isActive("italic"),
          command: (editor) => editor.chain().focus().toggleItalic().run(),
          icon: ItalicIcon,
        },
        {
          name: "underline",
          isActive: (editor) => editor.isActive("underline"),
          command: (editor) => editor.chain().focus().toggleUnderline().run(),
          icon: UnderlineIcon,
        },
        {
          name: "strike",
          isActive: (editor) => editor.isActive("strike"),
          command: (editor) => editor.chain().focus().toggleStrike().run(),
          icon: StrikethroughIcon,
        },
        {
          name: "code",
          isActive: (editor) => editor.isActive("code"),
          command: (editor) => editor.chain().focus().toggleCode().run(),
          icon: CodeIcon,
        },
      ];
      return (
        <div className='flex'>
          {items.map((item, index) => (
            <EditorBubbleItem
              key={index}
              onSelect={(editor) => {
                item.command(editor);
              }}>
              <Button size='icon' className='rounded-none' variant='ghost'>
                <item.icon
                  className={cn("h-4 w-4", {
                    "text-blue-500": item.isActive(editor),
                  })}
                />
              </Button>
            </EditorBubbleItem>
          ))}
        </div>
      );
    };
    ```
  </Accordion>

  <Accordion title="Color Selector" icon="palette">
    ```tsx color-selector.tsx
    import { Check, ChevronDown } from "lucide-react";
    import type { Dispatch, SetStateAction } from "react";
    import { EditorBubbleItem, useEditor } from "novel";

    import { PopoverTrigger, Popover, PopoverContent } from "@/components/tailwind/ui/popover";
    import { Button } from "@/components/tailwind/ui/button";
    export interface BubbleColorMenuItem {
      name: string;
      color: string;
    }

    interface ColorSelectorProps {
      isOpen: boolean;
      setIsOpen: Dispatch<SetStateAction<boolean>>;
    }

    const TEXT_COLORS: BubbleColorMenuItem[] = [
      {
        name: "Default",
        color: "var(--novel-black)",
      },
      {
        name: "Purple",
        color: "#9333EA",
      },
      {
        name: "Red",
        color: "#E00000",
      },
      {
        name: "Yellow",
        color: "#EAB308",
      },
      {
        name: "Blue",
        color: "#2563EB",
      },
      {
        name: "Green",
        color: "#008A00",
      },
      {
        name: "Orange",
        color: "#FFA500",
      },
      {
        name: "Pink",
        color: "#BA4081",
      },
      {
        name: "Gray",
        color: "#A8A29E",
      },
    ];

    const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
      {
        name: "Default",
        color: "var(--novel-highlight-default)",
      },
      {
        name: "Purple",
        color: "var(--novel-highlight-purple)",
      },
      {
        name: "Red",
        color: "var(--novel-highlight-red)",
      },
      {
        name: "Yellow",
        color: "var(--novel-highlight-yellow)",
      },
      {
        name: "Blue",
        color: "var(--novel-highlight-blue)",
      },
      {
        name: "Green",
        color: "var(--novel-highlight-green)",
      },
      {
        name: "Orange",
        color: "var(--novel-highlight-orange)",
      },
      {
        name: "Pink",
        color: "var(--novel-highlight-pink)",
      },
      {
        name: "Gray",
        color: "var(--novel-highlight-gray)",
      },
    ];

    interface ColorSelectorProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }

    export const ColorSelector = ({ open, onOpenChange }) => {
      const { editor } = useEditor();

      if (!editor) return null;
      const activeColorItem = TEXT_COLORS.find(({ color }) => editor.isActive("textStyle", { color }));

      const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) =>
        editor.isActive("highlight", { color })
      );

      return (
        <Popover modal={true} open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>
            <Button className='gap-2 rounded-none' variant='ghost'>
              <span
                className='rounded-sm px-1'
                style={{
                  color: activeColorItem?.color,
                  backgroundColor: activeHighlightItem?.color,
                }}>
                A
              </span>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            sideOffset={5}
            className='my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl '
            align='start'>
            <div className='flex flex-col'>
              <div className='my-1 px-2 text-sm font-semibold text-muted-foreground'>Color</div>
              {TEXT_COLORS.map(({ name, color }, index) => (
                <EditorBubbleItem
                  key={index}
                  onSelect={() => {
                    editor.commands.unsetColor();
                    name !== "Default" &&
                      editor
                        .chain()
                        .focus()
                        .setColor(color || "")
                        .run();
                  }}
                  className='flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent'>
                  <div className='flex items-center gap-2'>
                    <div className='rounded-sm border px-2 py-px font-medium' style={{ color }}>
                      A
                    </div>
                    <span>{name}</span>
                  </div>
                </EditorBubbleItem>
              ))}
            </div>
            <div>
              <div className='my-1 px-2 text-sm font-semibold text-muted-foreground'>Background</div>
              {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
                <EditorBubbleItem
                  key={index}
                  onSelect={() => {
                    editor.commands.unsetHighlight();
                    name !== "Default" && editor.commands.setHighlight({ color });
                  }}
                  className='flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='rounded-sm border px-2 py-px font-medium'
                      style={{ backgroundColor: color }}>
                      A
                    </div>
                    <span>{name}</span>
                  </div>
                  {editor.isActive("highlight", { color }) && <Check className='h-4 w-4' />}
                </EditorBubbleItem>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    };
    ```
  </Accordion>
</AccordionGroup>

```tsx editor.tsx
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";
import { TextButtons } from "./selectors/text-buttons";


...
<EditorContent>
  <EditorBubble
    tippyOptions={{
      placement: openAI ? "bottom-start" : "top",
    }}
    className='flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-xl'>
      <NodeSelector open={openNode} onOpenChange={setOpenNode} />
      <LinkSelector open={openLink} onOpenChange={setOpenLink} />
      <TextButtons />
      <ColorSelector open={openColor} onOpenChange={setOpenColor} />
  </EditorBubble>
</EditorContent>;
...
```


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt


# Extensions

> Styled and configured Tiptap extensions for your editor

<Info>You can use any Tiptap extensions or create your own.</Info>

## Default Extensions

```tsx extensions.ts
import {
  TiptapImage,
  TiptapLink,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
} from "novel/extensions";

import { cx } from "class-variance-authority";

// TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects

// You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-sm bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  TiptapLink,
  TiptapImage,
  UpdatedImage,
  taskList,
  taskItem,
  horizontalRule,
];
```

<Note>
  For intellisense in your VS Code editor you can also add this regex to the `settings.json`

  ```json
    "tailwindCSS.experimental.classRegex":[["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]],
  ```
</Note>

## Custom Extension

Coming soon


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Setup

> Follow this guide to set up Novel with Tailwindcss

<Info>
  This example demonstrates the use of Shadcn-ui for ui, but alternative
  libraries and components can also be employed.
</Info>

<Card title="Shadcn-ui" icon="link" href="https://ui.shadcn.com/docs/installation">
  You can find more info about installing shadcn-ui here. You will need to add
  the following components: <b>Button, Separator, Popover, Command, Dialog</b>
</Card>

This example will use the same stucture from here: [Anatomy](/quickstart#anatomy)\
You can find the full example here: [Tailwind Example](https://github.com/steven-tey/novel/blob/main/apps/web/components/tailwind/advanced-editor.tsx)

## Configure Wrapper

```tsx
"use client";

import { EditorContent, EditorRoot } from "novel";
import { useState } from "react";

const TailwindEditor = () => {
  const [content, setContent] = useState(null);
  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        onUpdate={({ editor }) => {
          const json = editor.getJSON();
          setContent(json);
        }}
      />
    </EditorRoot>
  );
};
export default TailwindEditor;
```

<Tip>
  `onUpdate` runs on every change. In most cases, you will want to debounce the updates to prevent too many state changes.

  ```tsx
  import { EditorInstance } from "novel"

  ...
  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    const json = editor.getJSON();
    setContent(json);
    setSaveStatus("Saved");
  }, 500);

  onUpdate={debouncedUpdates};
  ```
</Tip>

## Configure Extensions

<Card title="Extensions" icon="link" href="/guides/tailwind/extensions">
  You can find here example of extensions
</Card>

```tsx
import { defaultExtensions } from "./extensions";

const extensions = [...defaultExtensions];

<EditorContent
  extensions={extensions}
  ...
/>;
```

## Create Menus

<CardGroup cols={2}>
  <Card title="Slash Command" href="/guides/tailwind/slash-command" icon="terminal">
    Slash commands are a way to quickly insert content into the editor.
  </Card>

  <Card title="Bubble Menu" href="/guides/tailwind/bubble-menu" icon="square-caret-down">
    The bubble menu is a context menu that appears when you select text.
  </Card>
</CardGroup>

## Add Editor Props

`handleCommandNavigation` is required for fixing the arrow navigation in the / command;

```tsx
import { handleCommandNavigation } from "novel/extensions";
import { defaultEditorProps, EditorContent } from "novel";

<EditorContent
  ...
  editorProps={{
      handleDOMEvents: {
        keydown: (_view, event) => handleCommandNavigation(event),
      },
      attributes: {
        class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
      }
  }}
/>
```

## Add Styles

<AccordionGroup>
  <Accordion title="Prosemirror Styles" icon="css3">
    ```css prosemirror.css
    .ProseMirror {
      @apply p-12 px-8 sm:px-12;
    }

    .ProseMirror .is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: hsl(var(--muted-foreground));
      pointer-events: none;
      height: 0;
    }
    .ProseMirror .is-empty::before {
      content: attr(data-placeholder);
      float: left;
      color: hsl(var(--muted-foreground));
      pointer-events: none;
      height: 0;
    }

    /* Custom image styles */
    .ProseMirror img {
      transition: filter 0.1s ease-in-out;

      &:hover {
        cursor: pointer;
        filter: brightness(90%);
      }

      &.ProseMirror-selectednode {
        outline: 3px solid #5abbf7;
        filter: brightness(90%);
      }
    }

    .img-placeholder {
      position: relative;

      &:before {
        content: "";
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid var(--novel-stone-200);
        border-top-color: var(--novel-stone-800);
        animation: spinning 0.6s linear infinite;
      }
    }

    @keyframes spinning {
      to {
        transform: rotate(360deg);
      }
    }

    /* Custom TODO list checkboxes – shoutout to this awesome tutorial: https://moderncss.dev/pure-css-custom-checkbox-style/ */
    ul[data-type="taskList"] li > label {
      margin-right: 0.2rem;
      user-select: none;
    }

    @media screen and (max-width: 768px) {
      ul[data-type="taskList"] li > label {
        margin-right: 0.5rem;
      }
    }

    ul[data-type="taskList"] li > label input[type="checkbox"] {
      -webkit-appearance: none;
      appearance: none;
      background-color: hsl(var(--background));
      margin: 0;
      cursor: pointer;
      width: 1.2em;
      height: 1.2em;
      position: relative;
      top: 5px;
      border: 2px solid hsl(var(--border));
      margin-right: 0.3rem;
      display: grid;
      place-content: center;

      &:hover {
        background-color: hsl(var(--accent));
      }

      &:active {
        background-color: hsl(var(--accent));
      }

      &::before {
        content: "";
        width: 0.65em;
        height: 0.65em;
        transform: scale(0);
        transition: 120ms transform ease-in-out;
        box-shadow: inset 1em 1em;
        transform-origin: center;
        clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      }

      &:checked::before {
        transform: scale(1);
      }
    }

    ul[data-type="taskList"] li[data-checked="true"] > div > p {
      color: var(--muted-foreground);
      text-decoration: line-through;
      text-decoration-thickness: 2px;
    }

    /* Overwrite tippy-box original max-width */
    .tippy-box {
      max-width: 400px !important;
    }

    .ProseMirror:not(.dragging) .ProseMirror-selectednode {
      outline: none !important;
      background-color: var(--novel-highlight-blue);
      transition: background-color 0.2s;
      box-shadow: none;
    }

    .drag-handle {
      position: fixed;
      opacity: 1;
      transition: opacity ease-in 0.2s;
      border-radius: 0.25rem;

      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(0, 0, 0, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
      background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
      background-repeat: no-repeat;
      background-position: center;
      width: 1.2rem;
      height: 1.5rem;
      z-index: 50;
      cursor: grab;

      &:hover {
        background-color: var(--novel-stone-100);
        transition: background-color 0.2s;
      }

      &:active {
        background-color: var(--novel-stone-200);
        transition: background-color 0.2s;
        cursor: grabbing;
      }

      &.hide {
        opacity: 0;
        pointer-events: none;
      }

      @media screen and (max-width: 600px) {
        display: none;
        pointer-events: none;
      }
    }

    .dark .drag-handle {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(255, 255, 255, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
    }

    /* Custom Youtube Video CSS */
    iframe {
      border: 8px solid #ffd00027;
      border-radius: 4px;
      min-width: 200px;
      min-height: 200px;
      display: block;
      outline: 0px solid transparent;
    }

    div[data-youtube-video] > iframe {
      cursor: move;
      aspect-ratio: 16 / 9;
      width: 100%;
    }

    .ProseMirror-selectednode iframe {
      transition: outline 0.15s;
      outline: 6px solid #fbbf24;
    }

    @media only screen and (max-width: 480px) {
      div[data-youtube-video] > iframe {
        max-height: 50px;
      }
    }

    @media only screen and (max-width: 720px) {
      div[data-youtube-video] > iframe {
        max-height: 100px;
      }
    }

    /* CSS for bold coloring and highlighting issue*/
    span[style] > strong {
      color: inherit;
    }

    mark[style] > strong {
      color: inherit;
    }

    ```
  </Accordion>

  <Accordion title="Globals CSS" icon="globe">
    Update your globals.css with Novel css vars

    ```css globals.css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
      :root {
        ...
        --novel-highlight-default: #ffffff;
        --novel-highlight-purple: #f6f3f8;
        --novel-highlight-red: #fdebeb;
        --novel-highlight-yellow: #fbf4a2;
        --novel-highlight-blue: #c1ecf9;
        --novel-highlight-green: #acf79f;
        --novel-highlight-orange: #faebdd;
        --novel-highlight-pink: #faf1f5;
        --novel-highlight-gray: #f1f1ef;

      }

      .dark {
        ....

        --novel-highlight-default: #000000;
        --novel-highlight-purple: #3f2c4b;
        --novel-highlight-red: #5c1a1a;
        --novel-highlight-yellow: #5c4b1a;
        --novel-highlight-blue: #1a3d5c;
        --novel-highlight-green: #1a5c20;
        --novel-highlight-orange: #5c3a1a;
        --novel-highlight-pink: #5c1a3a;
        --novel-highlight-gray: #3a3a3a;

      }
    }

    ```
  </Accordion>
</AccordionGroup>

<Note>You need `require("@tailwindcss/typography")` for the prose styling</Note>

## Usage within Dialogs

Novel has been designed to work automatically within Radix Dialogs, namely by looking for the closest parent attribute `[role="dialog"]`. If you're using a different implementation for popups and dialogs, ensure you add this attribute above the editor so the drag handle calculates the correct position.


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt


# Slash Command

> Create a slash command to insert content into the editor.

## Define suggestions

We export a helper to define the suggestions that will be shown in the command palette. `createSuggestionItems`

```tsx
import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  MessageSquarePlus,
  Text,
  TextQuote,
} from "lucide-react";
import { createSuggestionItems } from "novel/extensions";
import { startImageUpload } from "novel/plugins";
import { Command, renderItems } from "novel/extensions";

export const suggestionItems = createSuggestionItems([
  {
    title: "Send Feedback",
    description: "Let us know how we can improve.",
    icon: <MessageSquarePlus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      window.open("/feedback", "_blank");
    },
  },
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
```

## Register the command

We need to add the command to the extensions array

```tsx
const extensions = [...defaultExtensions, slashCommand];

<EditorContent
  extensions={extensions}
  ...
/>;
```

## Create UI for the command

We map the suggestionItems and use the `EditorCommand` and `EditorCommandItem` components to create the UI for the command palette.
Components are wrapper over cmdk

```tsx
...
<EditorContent>
  <EditorCommand className='z-50 h-auto max-h-[330px]  w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all'>
    <EditorCommandEmpty className='px-2 text-muted-foreground'>No results</EditorCommandEmpty>
<EditorCommandList>
    {suggestionItems.map((item) => (
      <EditorCommandItem
        value={item.title}
        onCommand={(val) => item.command(val)}
        className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
        key={item.title}>
        <div className='flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background'>
          {item.icon}
        </div>
        <div>
          <p className='font-medium'>{item.title}</p>
          <p className='text-xs text-muted-foreground'>{item.description}</p>
        </div>
      </EditorCommandItem>
    ))}
</EditorCommandList>
  </EditorCommand>
</EditorContent>
...
```


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt

# Introduction

> Novel is a headless Notion-style WYSIWYG editor

<img className="block dark:hidden" src="https://mintlify.s3-us-west-1.amazonaws.com/novel/images/hero-light.png" alt="Hero Light" />

<img className="hidden dark:block" src="https://mintlify.s3-us-west-1.amazonaws.com/novel/images/hero-dark.png" alt="Hero Dark" />

## Features

TODO: Add features

## Tech Stack

Novel's codebase is [fully open-source](https://github.com/steven-tey/novel) and is built on top of the following technologies:

*   [Tiptap](https://tiptap.dev/) – framework
*   [TypeScript](https://www.typescriptlang.org/) – language
*   [RadixUI](https://www.radix-ui.com/primitives) – components
*   [Cmdk](https://cmdk.paco.me/) – command


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novel.mintlify.dev/docs/llms.txt