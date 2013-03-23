###
section: wysihat
mixin WysiHat.Commands

Methods will be mixed into the editor element. Most of these
methods will be used to bind to button clicks or key presses.

var editor = WysiHat.Editor.attach(textarea);
$('#bold_button').click(function(event) {
editor.boldSelection();
return false;
});

In this example, it is important to stop the click event so you don't
lose your current selection.
###
WysiHat.Commands = ((window) ->

  ###
  WysiHat.Commands#boldSelection() -> undefined

  Bolds the current selection.
  ###
  boldSelection = ->
    @execCommand "bold", false, null

  ###
  WysiHat.Commands#boldSelected() -> boolean

  Check if current selection is bold or strong.
  ###
  boldSelected = ->
    @queryCommandState "bold"

  ###
  WysiHat.Commands#underlineSelection() -> undefined

  Underlines the current selection.
  ###
  underlineSelection = ->
    @execCommand "underline", false, null

  ###
  WysiHat.Commands#underlineSelected() -> boolean

  Check if current selection is underlined.
  ###
  underlineSelected = ->
    @queryCommandState "underline"

  ###
  WysiHat.Commands#italicSelection() -> undefined

  Italicizes the current selection.
  ###
  italicSelection = ->
    @execCommand "italic", false, null

  ###
  WysiHat.Commands#italicSelected() -> boolean

  Check if current selection is italic or emphasized.
  ###
  italicSelected = ->
    @queryCommandState "italic"

  ###
  WysiHat.Commands#italicSelection() -> undefined

  Strikethroughs the current selection.
  ###
  strikethroughSelection = ->
    @execCommand "strikethrough", false, null

  ###
  WysiHat.Commands#indentSelection() -> undefined

  Indents the current selection.
  ###
  indentSelection = ->

    # TODO: Should use feature detection
    if $.browser.mozilla
      selection = undefined
      range = undefined
      node = undefined
      blockquote = undefined
      selection = window.getSelection()
      range = selection.getRangeAt(0)
      node = selection.getNode()
      if range.collapsed
        range = document.createRange()
        range.selectNodeContents node
        selection.removeAllRanges()
        selection.addRange range
      blockquote = $("<blockquote></blockquote>")
      range = selection.getRangeAt(0)
      range.surroundContents blockquote
    else
      @execCommand "indent", false, null

  ###
  WysiHat.Commands#outdentSelection() -> undefined

  Outdents the current selection.
  ###
  outdentSelection = ->
    @execCommand "outdent", false, null

  ###
  WysiHat.Commands#toggleIndentation() -> undefined

  Toggles indentation the current selection.
  ###
  toggleIndentation = ->
    if @indentSelected()
      @outdentSelection()
    else
      @indentSelection()

  ###
  WysiHat.Commands#indentSelected() -> boolean

  Check if current selection is indented.
  ###
  indentSelected = ->
    node = window.getSelection().getNode()
    node.is "blockquote, blockquote *"

  ###
  WysiHat.Commands#fontSelection(font) -> undefined

  Sets the font for the current selection
  ###
  fontSelection = (font) ->
    @execCommand "fontname", false, font

  ###
  WysiHat.Commands#fontSizeSelection(fontSize) -> undefined
  - font size (int) : font size for selection

  Sets the font size for the current selection
  ###
  fontSizeSelection = (fontSize) ->
    @execCommand "fontsize", false, fontSize

  ###
  WysiHat.Commands#colorSelection(color) -> undefined
  - color (String): a color name or hexadecimal value

  Sets the foreground color of the current selection.
  ###
  colorSelection = (color) ->
    @execCommand "forecolor", false, color

  ###
  WysiHat.Commands#backgroundColorSelection(color) -> undefined
  - color (string) - a color or hexadecimal value

  Sets the background color.  Firefox will fill in the background
  color of the entire iframe unless hilitecolor is used.
  ###
  backgroundColorSelection = (color) ->
    if $.browser.mozilla
      @execCommand "hilitecolor", false, color
    else
      @execCommand "backcolor", false, color

  ###
  WysiHat.Commands#alignSelection(color) -> undefined
  - alignment (string) - how the text should be aligned (left, center, right)
  ###
  alignSelection = (alignment) ->
    @execCommand "justify" + alignment

  ###
  WysiHat.Commands#backgroundColorSelected() -> alignment

  Returns the alignment of the selected text area
  ###
  alignSelected = ->
    node = window.getSelection().getNode()
    $(node).css "textAlign"

  ###
  WysiHat.Commands#linkSelection(url) -> undefined
  - url (String): value for href

  Wraps the current selection in a link.
  ###
  linkSelection = (url) ->
    @execCommand "createLink", false, url

  ###
  WysiHat.Commands#unlinkSelection() -> undefined

  Selects the entire link at the cursor and removes it
  ###
  unlinkSelection = ->
    node = window.getSelection().getNode()
    window.getSelection().selectNode node  if @linkSelected()
    @execCommand "unlink", false, null

  ###
  WysiHat.Commands#linkSelected() -> boolean

  Check if current selection is link.
  ###
  linkSelected = ->
    node = window.getSelection().getNode()
    (if node then node.get(0).tagName.toUpperCase() is "A" else false)

  ###
  WysiHat.Commands#formatblockSelection(element) -> undefined
  - element (String): the type of element you want to wrap your selection
  with (like 'h1' or 'p').

  Wraps the current selection in a header or paragraph.
  ###
  formatblockSelection = (element) ->
    @execCommand "formatblock", false, element

  ###
  WysiHat.Commands#toggleOrderedList() -> undefined

  Formats current selection as an ordered list. If the selection is empty
  a new list is inserted.

  If the selection is already a ordered list, the entire list
  will be toggled. However, toggling the last item of the list
  will only affect that item, not the entire list.
  ###
  toggleOrderedList = ->
    selection = undefined
    node = undefined
    selection = window.getSelection()
    node = selection.getNode()
    if @orderedListSelected() and not node.is("ol li:last-child, ol li:last-child *")
      selection.selectNode node.closest("ol")

    # Toggle list type
    else selection.selectNode node.closest("ul")  if @unorderedListSelected()
    @execCommand "insertorderedlist", false, null

  ###
  WysiHat.Commands#insertOrderedList() -> undefined

  Alias for WysiHat.Commands#toggleOrderedList
  ###
  insertOrderedList = ->
    @toggleOrderedList()

  ###
  WysiHat.Commands#orderedListSelected() -> boolean

  Check if current selection is within an ordered list.
  ###
  orderedListSelected = ->
    element = window.getSelection().getNode()
    return element.is("*[contenteditable=\"\"] ol, *[contenteditable=true] ol, *[contenteditable=\"\"] ol *, *[contenteditable=true] ol *")  if element
    false

  ###
  WysiHat.Commands#toggleUnorderedList() -> undefined

  Formats current selection as an unordered list. If the selection is empty
  a new list is inserted.

  If the selection is already a unordered list, the entire list
  will be toggled. However, toggling the last item of the list
  will only affect that item, not the entire list.
  ###
  toggleUnorderedList = ->
    selection = undefined
    node = undefined
    selection = window.getSelection()
    node = selection.getNode()
    if @unorderedListSelected() and not node.is("ul li:last-child, ul li:last-child *")
      selection.selectNode node.closest("ul")

    # Toggle list type
    else selection.selectNode node.closest("ol")  if @orderedListSelected()
    @execCommand "insertunorderedlist", false, null

  ###
  WysiHat.Commands#insertUnorderedList() -> undefined

  Alias for WysiHat.Commands#toggleUnorderedList()
  ###
  insertUnorderedList = ->
    @toggleUnorderedList()

  ###
  WysiHat.Commands#unorderedListSelected() -> boolean

  Check if current selection is within an unordered list.
  ###
  unorderedListSelected = ->
    element = window.getSelection().getNode()
    return element.is("*[contenteditable=\"\"] ul, *[contenteditable=true] ul, *[contenteditable=\"\"] ul *, *[contenteditable=true] ul *")  if element
    false

  ###
  WysiHat.Commands#insertImage(url) -> undefined

  - url (String): value for src
  Insert an image at the insertion point with the given url.
  ###
  insertImage = (url) ->
    @execCommand "insertImage", false, url

  ###
  WysiHat.Commands#insertHTML(html) -> undefined

  - html (String): HTML or plain text
  Insert HTML at the insertion point.
  ###
  insertHTML = (html) ->
    if $.browser.msie
      range = window.document.selection.createRange()
      range.pasteHTML html
      range.collapse false
      range.select()
    else
      @execCommand "insertHTML", false, html

  ###
  WysiHat.Commands#execCommand(command[, ui = false][, value = null]) -> undefined
  - command (String): Command to execute
  - ui (Boolean): Boolean flag for showing UI. Currenty this not
  implemented by any browser. Just use false.
  - value (String): Value to pass to command

  A simple delegation method to the documents execCommand method.
  ###
  execCommand = (command, ui, value) ->
    handler = @commands[command]
    if handler
      handler.bind(this) value
    else
      try
        window.document.execCommand command, ui, value
      catch e
        return null
    $(document.activeElement).trigger "field:change"

  ###
  WysiHat.Commands#queryCommandState(state) -> Boolean
  - state (String): bold, italic, underline, etc

  A delegation method to the document's queryCommandState method.

  Custom states handlers can be added to the queryCommands hash,
  which will be checked before calling the native queryCommandState
  command.

  editor.queryCommands.set("link", editor.linkSelected);
  ###
  queryCommandState = (state) ->
    handler = @queryCommands[state]
    if handler
      handler()
    else
      try
        return window.document.queryCommandState(state)
      catch e
        return null

  ###
  WysiHat.Commands#getSelectedStyles() -> Hash

  Fetches the styles (from the styleSelectors hash) from the current
  selection and returns it as a hash
  ###
  getSelectedStyles = ->
    styles = {}
    editor = this
    editor.styleSelectors.each (style) ->
      node = editor.selection.getNode()
      styles[style.first()] = $(node).css(style.last())

    styles
  boldSelection: boldSelection
  boldSelected: boldSelected
  underlineSelection: underlineSelection
  underlineSelected: underlineSelected
  italicSelection: italicSelection
  italicSelected: italicSelected
  strikethroughSelection: strikethroughSelection
  indentSelection: indentSelection
  outdentSelection: outdentSelection
  toggleIndentation: toggleIndentation
  indentSelected: indentSelected
  fontSelection: fontSelection
  fontSizeSelection: fontSizeSelection
  colorSelection: colorSelection
  backgroundColorSelection: backgroundColorSelection
  alignSelection: alignSelection
  alignSelected: alignSelected
  linkSelection: linkSelection
  unlinkSelection: unlinkSelection
  linkSelected: linkSelected
  formatblockSelection: formatblockSelection
  toggleOrderedList: toggleOrderedList
  insertOrderedList: insertOrderedList
  orderedListSelected: orderedListSelected
  toggleUnorderedList: toggleUnorderedList
  insertUnorderedList: insertUnorderedList
  unorderedListSelected: unorderedListSelected
  insertImage: insertImage
  insertHTML: insertHTML
  execCommand: execCommand
  queryCommandState: queryCommandState
  getSelectedStyles: getSelectedStyles
  commands: {}
  queryCommands:
    link: linkSelected
    numbers: orderedListSelected
    bullets: unorderedListSelected

  styleSelectors:
    fontname: "fontFamily"
    fontsize: "fontSize"
    forecolor: "color"
    hilitecolor: "backgroundColor"
    backcolor: "backgroundColor"
)(window)