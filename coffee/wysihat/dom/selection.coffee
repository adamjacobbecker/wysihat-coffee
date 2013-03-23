if jQuery.browser.msie and jQuery.browser.version < 9.0
  jQuery.extend Selection::, (->

    # TODO: More robust getNode
    getNode = ->
      range = @_document.selection.createRange()
      jQuery range.parentElement()

    # TODO: IE selectNode should work with range.selectNode
    selectNode = (element) ->
      range = @_document.body.createTextRange()
      range.moveToElementText element
      range.select()
    getNode: getNode
    selectNode: selectNode
  )()
else

  # WebKit does not have a public Selection prototype
  if typeof Selection is "undefined"
    Selection = {}
    Selection:: = window.getSelection().__proto__
  jQuery.extend Selection::, (->
    getNode = ->
      if @rangeCount > 0
        @getRangeAt(0).getNode()
      else
        null
    selectNode = (element) ->
      range = document.createRange()
      range.selectNode element[0]
      @removeAllRanges()
      @addRange range
    getNode: getNode
    selectNode: selectNode
  )()