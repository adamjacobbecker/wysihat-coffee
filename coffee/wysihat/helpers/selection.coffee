class WysiHat.Helpers.Selection
  @save: ->
    if window.getSelection
      sel = window.getSelection()
      return sel.getRangeAt(0)  if sel.getRangeAt and sel.rangeCount
    else return document.selection.createRange()  if document.selection and document.selection.createRange
    null

  @restore: (range) ->
    if range
      if window.getSelection
        sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange range
      else range.select()  if document.selection and range.select