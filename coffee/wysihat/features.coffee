WysiHat.BrowserFeatures = (->
  createTmpIframe = (callback) ->
    frame = undefined
    frameDocument = undefined
    frame = $("<iframe></iframe>")
    frame.css
      position: "absolute"
      left: "-1000px"

    frame.onFrameLoaded ->
      if typeof frame.contentDocument isnt "undefined"
        frameDocument = frame.contentDocument
      else frameDocument = frame.contentWindow.document  if typeof frame.contentWindow isnt "undefined" and typeof frame.contentWindow.document isnt "undefined"
      frameDocument.designMode = "on"
      callback frameDocument
      frame.remove()

    $(document.body).insert frame
  detectParagraphType = (document) ->
    document.body.innerHTML = ""
    document.execCommand "insertparagraph", false, null
    tagName = undefined
    element = document.body.childNodes[0]
    tagName = element.tagName.toLowerCase()  if element and element.tagName
    if tagName is "div"
      features.paragraphType = "div"
    else if document.body.innerHTML is "<p><br></p>"
      features.paragraphType = "br"
    else
      features.paragraphType = "p"
  detectIndentType = (document) ->
    document.body.innerHTML = "tab"
    document.execCommand "indent", false, null
    tagName = undefined
    element = document.body.childNodes[0]
    tagName = element.tagName.toLowerCase()  if element and element.tagName
    features.indentInsertsBlockquote = (tagName is "blockquote")
  features = {}
  features.run = run = ->
    return  if features.finished
    createTmpIframe (document) ->
      detectParagraphType document
      detectIndentType document
      features.finished = true


  features
)()