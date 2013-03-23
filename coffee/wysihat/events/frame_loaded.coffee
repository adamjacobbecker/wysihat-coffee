(->
  onReadyStateComplete = (document, callback) ->
    checkReadyState = ->
      if document.readyState is "complete"

        # TODO: the prototype code checked to see if the event exists before removing it.
        $(document).unbind "readystatechange", checkReadyState
        callback()
        true
      else
        false
    $(document).bind "readystatechange", checkReadyState
    checkReadyState()
  observeFrameContentLoaded = (element) ->
    fireFrameLoaded = ->
      return  if loaded
      loaded = true
      contentLoadedHandler.stop()  if contentLoadedHandler
      element.trigger "frame:loaded"
    element = $(element)
    bare = element.get(0)
    loaded = undefined
    contentLoadedHandler = undefined
    loaded = false
    if window.addEventListener
      contentLoadedHandler = $(document).bind("DOMFrameContentLoaded", (event) ->
        fireFrameLoaded()  if element is $(this)
      )
    element.load ->
      frameDocument = undefined
      if typeof element.contentDocument isnt "undefined"
        frameDocument = element.contentDocument
      else frameDocument = element.contentWindow.document  if typeof element.contentWindow isnt "undefined" and typeof element.contentWindow.document isnt "undefined"
      onReadyStateComplete frameDocument, fireFrameLoaded

    element
  onFrameLoaded = (element, callback) ->
    element.bind "frame:loaded", callback
    element.observeFrameContentLoaded()
  jQuery.fn.observeFrameContentLoaded = observeFrameContentLoaded
  jQuery.fn.onFrameLoaded = onFrameLoaded
)()