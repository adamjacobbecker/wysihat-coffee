$(document).ready ->
  doc = $(document)
  if "selection" of document and "onselectionchange" of document
    selectionChangeHandler = ->
      range = document.selection.createRange()
      element = range.parentElement()
      $(element).trigger "selection:change"

    doc.bind "selectionchange", selectionChangeHandler
  else
    previousRange = undefined
    selectionChangeHandler = ->
      element = document.activeElement
      elementTagName = element.tagName.toLowerCase()
      if elementTagName is "textarea" or elementTagName is "input"
        previousRange = null
        $(element).trigger "selection:change"
      else
        selection = window.getSelection()
        return  if selection.rangeCount < 1
        range = selection.getRangeAt(0)
        return  if range and range.equalRange(previousRange)
        previousRange = range
        element = range.commonAncestorContainer
        element = element.parentNode  while element.nodeType is Node.TEXT_NODE
        $(element).trigger "selection:change"

    doc.mouseup selectionChangeHandler
    doc.keyup selectionChangeHandler
