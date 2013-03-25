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
    $(node).closest('a').length > 0

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
