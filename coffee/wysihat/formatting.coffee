WysiHat.Formatting =
  ACCUMULATING_LINE: {}
  EXPECTING_LIST_ITEM: {}
  ACCUMULATING_LIST_ITEM: {}
  getBrowserMarkupFrom: (applicationMarkup) ->
    spanify = (element, style) ->
      $(element).replaceWith "<span style=\"" + style + "\">" + element.innerHTML + "</span>"
    convertStrongsToSpans = ->
      container.find("strong").each (index, element) ->
        spanify element, "font-weight: bold"

    convertEmsToSpans = ->
      container.find("em").each (index, element) ->
        spanify element, "font-style: italic"

    convertDivsToParagraphs = ->
      container.find("div").each (index, element) ->
        $(element).replaceWith "<p>" + element.innerHTML + "</p>"

    container = $("<div>" + applicationMarkup + "</div>")
    if $.browser.webkit or $.browser.mozilla
      convertStrongsToSpans()
      convertEmsToSpans()
    else convertDivsToParagraphs()  if $.browser.msie or $.browser.opera
    container.html()

  getApplicationMarkupFrom: ($element) ->

    element = $element.get(0)
    mode = WysiHat.Formatting.ACCUMULATING_LINE
    result = undefined
    container = undefined
    line = undefined
    lineContainer = undefined
    previousAccumulation = undefined

    walk = (nodes) ->
      length = nodes.length
      node = undefined
      tagName = undefined
      i = undefined
      i = 0
      while i < length
        node = nodes[i]
        if node.nodeType is 1
          tagName = node.tagName.toLowerCase()
          open tagName, node
          walk node.childNodes
          close tagName
        else read node.nodeValue  if node.nodeType is 3
        i++
    open = (tagName, node) ->
      if mode is WysiHat.Formatting.ACCUMULATING_LINE

        # if it's a block-level element and the line buffer is full, flush it
        if isBlockElement(tagName)
          accumulate $("<br />").get(0)  if isEmptyParagraph(node)
          flush()

          # if it's a ul or ol, switch to expecting-list-item mode
          if isListElement(tagName)
            container = insertList(tagName)
            mode = WysiHat.Formatting.EXPECTING_LIST_ITEM
        else if isLineBreak(tagName)

          # if it's a br, and the previous accumulation was a br,
          # remove the previous accumulation and flush
          if isLineBreak(getPreviouslyAccumulatedTagName())
            previousAccumulation.parentNode.removeChild previousAccumulation
            flush()

          # accumulate the br
          accumulate node.cloneNode(false)

          # if it's the first br in a line, flush
          flush()  unless previousAccumulation.previousNode
        else
          accumulateInlineElement tagName, node
      else if mode is WysiHat.Formatting.EXPECTING_LIST_ITEM
        mode = WysiHat.Formatting.ACCUMULATING_LIST_ITEM  if isListItemElement(tagName)
      else if mode is WysiHat.Formatting.ACCUMULATING_LIST_ITEM
        if isLineBreak(tagName)
          accumulate node.cloneNode(false)
        else accumulateInlineElement tagName, node  unless isBlockElement(tagName)
    close = (tagName) ->
      if mode is WysiHat.Formatting.ACCUMULATING_LINE
        flush()  if isLineElement(tagName)
        lineContainer = lineContainer.parentNode  unless line is lineContainer
      else if mode is WysiHat.Formatting.EXPECTING_LIST_ITEM
        if isListElement(tagName)
          container = result
          mode = WysiHat.Formatting.ACCUMULATING_LINE
      else if mode is WysiHat.Formatting.ACCUMULATING_LIST_ITEM
        if isListItemElement(tagName)
          flush()
          mode = WysiHat.Formatting.EXPECTING_LIST_ITEM
        lineContainer = lineContainer.parentNode  unless line is lineContainer
    isBlockElement = (tagName) ->
      isLineElement(tagName) or isListElement(tagName)
    isLineElement = (tagName) ->
      tagName is "p" or tagName is "div"
    isListElement = (tagName) ->
      tagName is "ol" or tagName is "ul"
    isListItemElement = (tagName) ->
      tagName is "li"
    isLineBreak = (tagName) ->
      tagName is "br"
    isEmptyParagraph = (node) ->
      node.tagName.toLowerCase() is "p" and node.childNodes.length is 0
    read = (value) ->
      accumulate document.createTextNode(value)
    accumulateInlineElement = (tagName, node) ->
      element = node.cloneNode(false)
      if tagName is "span"
        if $(node).css("fontWeight") is "bold"
          element = $("<strong></strong>").get(0)
        else element = $("<em></em>").get(0)  if $(node).css("fontStyle") is "italic"
      accumulate element
      lineContainer = element
    accumulate = (node) ->
      unless mode is WysiHat.Formatting.EXPECTING_LIST_ITEM
        line = lineContainer = createLine()  unless line
        previousAccumulation = node
        lineContainer.appendChild node
    getPreviouslyAccumulatedTagName = ->
      previousAccumulation.tagName.toLowerCase()  if previousAccumulation and previousAccumulation.nodeType is 1
    flush = ->
      if line and line.childNodes.length
        container.appendChild line
        line = lineContainer = null
    createLine = ->
      if mode is WysiHat.Formatting.ACCUMULATING_LINE
        $("<div></div>").get 0
      else $("<li></li>").get 0  if mode is WysiHat.Formatting.ACCUMULATING_LIST_ITEM
    insertList = (tagName) ->
      list = $("<" + tagName + "></" + tagName + ">").get(0)
      result.appendChild list
      list
    result = container = $("<div></div>").get(0)
    walk element.childNodes
    flush()
    result.innerHTML
