if jQuery.browser.msie
  jQuery.extend Selection::, (->
    setBookmark = ->
      bookmark = jQuery("#bookmark")
      bookmark.remove()  if bookmark
      bookmark = jQuery("<span id=\"bookmark\">&nbsp;</span>")
      parent = jQuery("<div></div>").html(bookmark)
      range = @_document.selection.createRange()
      range.collapse()
      range.pasteHTML parent.html()
    moveToBookmark = ->
      bookmark = jQuery("#bookmark")
      return  unless bookmark
      range = @_document.selection.createRange()
      range.moveToElementText bookmark
      range.collapse()
      range.select()
      bookmark.remove()
    setBookmark: setBookmark
    moveToBookmark: moveToBookmark
  )()
else
  jQuery.extend Selection::, (->
    setBookmark = ->
      bookmark = jQuery("#bookmark")
      bookmark.remove()  if bookmark
      bookmark = jQuery("<span id=\"bookmark\">&nbsp;</span>")
      @getRangeAt(0).insertNode bookmark
    moveToBookmark = ->
      bookmark = jQuery("#bookmark")
      return  unless bookmark
      range = document.createRange()
      range.setStartBefore bookmark
      @removeAllRanges()
      @addRange range
      bookmark.remove()
    setBookmark: setBookmark
    moveToBookmark: moveToBookmark
  )()