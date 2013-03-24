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
WysiHat.StyleSelectors =
  fontname: "fontFamily"
  fontsize: "fontSize"
  forecolor: "color"
  hilitecolor: "backgroundColor"
  backcolor: "backgroundColor"

WysiHat.ExecCommand = (command, ui, value) ->
  try
    window.document.execCommand command, ui, value
  catch e
    return null

  $(document.activeElement).trigger "field:change"


WysiHat.Commands =
  bold: ->
    @execCommand "bold", false, null

  underline: ->
    @execCommand "underline", false, null

  italic: ->
    @execCommand "italic", false, null

  strikethrough: ->
    @execCommand "strikethrough", false, null

  indent: ->
    # @todo Should use feature detection
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

  outdent: ->
    @execCommand "outdent", false, null

  toggleIndentation: ->
    if @indentSelected()
      @outdentSelection()
    else
      @indentSelection()

  fontSize: (fontSize) ->
    @execCommand "fontsize", false, fontSize

  color: (color) ->
    @execCommand "forecolor", false, color

  backgroundColor: (color) ->
    if $.browser.mozilla
      @execCommand "hilitecolor", false, color
    else
      @execCommand "backcolor", false, color

  align: (alignment) ->
    @execCommand "justify" + alignment

  link: (url) ->
    @execCommand "createLink", false, url

  unlink: ->
    node = window.getSelection().getNode()
    window.getSelection().selectNode node if @linkSelected()
    @execCommand "unlink", false, null

  ###
  WysiHat.Commands#formatblockSelection(element) -> undefined
  - element (String): the type of element you want to wrap your selection
  with (like 'h1' or 'p').

  Wraps the current selection in a header or paragraph.
  ###
  formatblock: (element) ->
    @execCommand "formatblock", false, element

  ###
  WysiHat.Commands#toggleOrderedList() -> undefined

  Formats current selection as an ordered list. If the selection is empty
  a new list is inserted.

  If the selection is already a ordered list, the entire list
  will be toggled. However, toggling the last item of the list
  will only affect that item, not the entire list.
  ###
  orderedList: ->
    selection = undefined
    node = undefined
    selection = window.getSelection()
    node = selection.getNode()
    if @states.orderedList() and not node.is("ol li:last-child, ol li:last-child *")
      selection.selectNode node.closest("ol")

    # Toggle list type
    else selection.selectNode node.closest("ul") if @states.unorderedList()
    @execCommand "insertorderedlist", false, null


  ###
  WysiHat.Commands#toggleUnorderedList() -> undefined

  Formats current selection as an unordered list. If the selection is empty
  a new list is inserted.

  If the selection is already a unordered list, the entire list
  will be toggled. However, toggling the last item of the list
  will only affect that item, not the entire list.
  ###
  unorderedList: ->
    selection = undefined
    node = undefined
    selection = window.getSelection()
    node = selection.getNode()
    if @states.unorderedList() and not node.is("ul li:last-child, ul li:last-child *")
      selection.selectNode node.closest("ul")

    # Toggle list type
    else selection.selectNode node.closest("ol")  if @states.orderedList()
    @execCommand "insertunorderedlist", false, null


  ###
  WysiHat.Commands#insertImage(url) -> undefined

  - url (String): value for src
  Insert an image at the insertion point with the given url.
  ###
  insertImage: (url) ->
    @execCommand "insertImage", false, url

  ###
  WysiHat.Commands#insertHTML(html) -> undefined

  - html (String): HTML or plain text
  Insert HTML at the insertion point.
  ###
  insertHTML: (html) ->
    if $.browser.msie
      range = window.document.selection.createRange()
      range.pasteHTML html
      range.collapse false
      range.select()
    else
      @execCommand "insertHTML", false, html

  getSelectedStyles: ->
    styles = {}
    editor = this
    editor.styleSelectors.each (style) ->
      node = editor.selection.getNode()
      styles[style.first()] = $(node).css(style.last())

    styles

WysiHat.States =

  queryCommandState: (state) ->
    handler = @states["#{state}"]
    if handler
      handler()
    else
      try
        return window.document.queryCommandState(state)
      catch e
        return null

  indented: ->
    node = window.getSelection().getNode()
    node.is "blockquote, blockquote *"

  aligned: ->
    node = window.getSelection().getNode()
    $(node).css "textAlign"

  linked: ->
    node = window.getSelection().getNode()
    (if node then node.get(0).tagName.toUpperCase() is "A" else false)

  ###
  WysiHat.Commands#orderedListSelected() -> boolean

  Check if current selection is within an ordered list.
  ###
  orderedList: ->
    element = window.getSelection().getNode()
    return element.is("*[contenteditable=\"\"] ol, *[contenteditable=true] ol, *[contenteditable=\"\"] ol *, *[contenteditable=true] ol *")  if element
    false

  ###
  WysiHat.Commands#unorderedListSelected() -> boolean

  Check if current selection is within an unordered list.
  ###
  unorderedList: ->
    element = window.getSelection().getNode()
    return element.is("*[contenteditable=\"\"] ul, *[contenteditable=true] ul, *[contenteditable=\"\"] ul *, *[contenteditable=true] ul *")  if element
    false

