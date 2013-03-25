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
    window.getSelection().selectNode node if @states.linked()
    @execCommand "unlink", false, null

  formatblock: (element) ->
    @execCommand "formatblock", false, element

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

  insertImage: (url) ->
    @execCommand "insertImage", false, url

  insertHTML: (html) ->
    if $.browser.msie
      range = window.document.selection.createRange()
      range.pasteHTML html
      range.collapse false
      range.select()
    else
      @execCommand "insertHTML", false, html
