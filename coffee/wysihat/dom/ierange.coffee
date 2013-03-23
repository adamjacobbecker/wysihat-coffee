#  IE Selection and Range classes
# *
# *  Original created by Tim Cameron Ryan
# *    http://github.com/timcameronryan/IERange
# *  Copyright (c) 2009 Tim Cameron Ryan
# *  Released under the MIT/X License
# *
# *  Modified by Joshua Peek
#
unless window.getSelection

  # TODO: Move this object into a closure
  DOMUtils =
    isDataNode: (node) ->
      try
        return node and node.nodeValue isnt null and node.data isnt null
      catch e
        return false

    isAncestorOf: (parent, node) ->
      return false  unless parent
      not DOMUtils.isDataNode(parent) and (parent.contains((if DOMUtils.isDataNode(node) then node.parentNode else node)) or node.parentNode is parent)

    isAncestorOrSelf: (root, node) ->
      DOMUtils.isAncestorOf(root, node) or root is node

    findClosestAncestor: (root, node) ->
      node = node.parentNode  while node and node.parentNode isnt root  if DOMUtils.isAncestorOf(root, node)
      node

    getNodeLength: (node) ->
      (if DOMUtils.isDataNode(node) then node.length else node.childNodes.length)

    splitDataNode: (node, offset) ->
      return false  unless DOMUtils.isDataNode(node)
      newNode = node.cloneNode(false)
      node.deleteData offset, node.length
      newNode.deleteData 0, offset
      node.parentNode.insertBefore newNode, node.nextSibling

  window.Range = (->
    Range = (document) ->

      # save document parameter
      @_document = document

      # initialize range
      @startContainer = @endContainer = document.body
      @endOffset = DOMUtils.getNodeLength(document.body)
    findChildPosition = (node) ->
      i = 0

      while node = node.previousSibling
        continue
        i++
      i

    # find anchor node and offset

    # visible data nodes need a text offset

    # create a cursor element node to position range (since we can't select text nodes)

    # move range

    # return an IE text range

    # collapsed attribute

    # find common ancestor

    # set start to beore this node

    # select next sibling

    # set end to beore this node

    # select next sibling

    # clone subtree

    # cache range and move anchor points

    # extract range

    # cache range and move anchor points

    # delete range

    # set original anchor and insert node

    # resync start anchor

    # extract and surround contents

    # get anchors

    # compare

    # return cloned range

    # parse the tag string in a context node

    # return a document fragment from the created node
    RangeIterator = (range) ->
      @range = range
      return  if range.collapsed

      # get anchors
      root = range.commonAncestorContainer
      @_next = (if range.startContainer is root and not DOMUtils.isDataNode(range.startContainer) then range.startContainer.childNodes[range.startOffset] else DOMUtils.findClosestAncestor(root, range.startContainer))
      @_end = (if range.endContainer is root and not DOMUtils.isDataNode(range.endContainer) then range.endContainer.childNodes[range.endOffset] else DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling)
    Range.START_TO_START = 0
    Range.START_TO_END = 1
    Range.END_TO_END = 2
    Range.END_TO_START = 3
    Range:: =
      startContainer: null
      startOffset: 0
      endContainer: null
      endOffset: 0
      commonAncestorContainer: null
      collapsed: false
      _document: null
      _toTextRange: ->
        adoptEndPoint = (textRange, domRange, bStart) ->
          container = domRange[(if bStart then "startContainer" else "endContainer")]
          offset = domRange[(if bStart then "startOffset" else "endOffset")]
          textOffset = 0
          anchorNode = (if DOMUtils.isDataNode(container) then container else container.childNodes[offset])
          anchorParent = (if DOMUtils.isDataNode(container) then container.parentNode else container)
          textOffset = offset  if container.nodeType is 3 or container.nodeType is 4
          cursorNode = domRange._document.createElement("a")
          if anchorNode
            anchorParent.insertBefore cursorNode, anchorNode
          else
            anchorParent.appendChild cursorNode
          cursor = domRange._document.body.createTextRange()
          cursor.moveToElementText cursorNode
          cursorNode.parentNode.removeChild cursorNode
          textRange.setEndPoint (if bStart then "StartToStart" else "EndToStart"), cursor
          textRange[(if bStart then "moveStart" else "moveEnd")] "character", textOffset
        textRange = @_document.body.createTextRange()
        adoptEndPoint textRange, this, true
        adoptEndPoint textRange, this, false
        textRange

      _refreshProperties: ->
        @collapsed = (@startContainer is @endContainer and @startOffset is @endOffset)
        node = @startContainer
        node = node.parentNode  while node and node isnt @endContainer and not DOMUtils.isAncestorOf(node, @endContainer)
        @commonAncestorContainer = node

      setStart: (container, offset) ->
        @startContainer = container
        @startOffset = offset
        @_refreshProperties()

      setEnd: (container, offset) ->
        @endContainer = container
        @endOffset = offset
        @_refreshProperties()

      setStartBefore: (refNode) ->
        @setStart refNode.parentNode, findChildPosition(refNode)

      setStartAfter: (refNode) ->
        @setStart refNode.parentNode, findChildPosition(refNode) + 1

      setEndBefore: (refNode) ->
        @setEnd refNode.parentNode, findChildPosition(refNode)

      setEndAfter: (refNode) ->
        @setEnd refNode.parentNode, findChildPosition(refNode) + 1

      selectNode: (refNode) ->
        @setStartBefore refNode
        @setEndAfter refNode

      selectNodeContents: (refNode) ->
        @setStart refNode, 0
        @setEnd refNode, DOMUtils.getNodeLength(refNode)

      collapse: (toStart) ->
        if toStart
          @setEnd @startContainer, @startOffset
        else
          @setStart @endContainer, @endOffset

      cloneContents: ->
        (cloneSubtree = (iterator) ->
          node = undefined
          frag = document.createDocumentFragment()

          while node = iterator.next()
            node = node.cloneNode(not iterator.hasPartialSubtree())
            node.appendChild cloneSubtree(iterator.getSubtreeIterator())  if iterator.hasPartialSubtree()
            frag.appendChild node
          frag
        ) new RangeIterator(this)

      extractContents: ->
        range = @cloneRange()
        @setStartAfter DOMUtils.findClosestAncestor(@commonAncestorContainer, @startContainer)  unless @startContainer is @commonAncestorContainer
        @collapse true
        (extractSubtree = (iterator) ->
          node = undefined
          frag = document.createDocumentFragment()

          while node = iterator.next()
            (if iterator.hasPartialSubtree() then node = node.cloneNode(false) else iterator.remove())
            node.appendChild extractSubtree(iterator.getSubtreeIterator())  if iterator.hasPartialSubtree()
            frag.appendChild node
          frag
        ) new RangeIterator(range)

      deleteContents: ->
        range = @cloneRange()
        @setStartAfter DOMUtils.findClosestAncestor(@commonAncestorContainer, @startContainer)  unless @startContainer is @commonAncestorContainer
        @collapse true
        (deleteSubtree = (iterator) ->
          (if iterator.hasPartialSubtree() then deleteSubtree(iterator.getSubtreeIterator()) else iterator.remove())  while iterator.next()
        ) new RangeIterator(range)

      insertNode: (newNode) ->
        if DOMUtils.isDataNode(@startContainer)
          DOMUtils.splitDataNode @startContainer, @startOffset
          @startContainer.parentNode.insertBefore newNode, @startContainer.nextSibling
        else
          offsetNode = @startContainer.childNodes[@startOffset]
          if offsetNode
            @startContainer.insertBefore newNode, offsetNode
          else
            @startContainer.appendChild newNode
        @setStart @startContainer, @startOffset

      surroundContents: (newNode) ->
        content = @extractContents()
        @insertNode newNode
        newNode.appendChild content
        @selectNode newNode

      compareBoundaryPoints: (how, sourceRange) ->
        containerA = undefined
        offsetA = undefined
        containerB = undefined
        offsetB = undefined
        switch how
          when Range.START_TO_START, Range.START_TO_END
            containerA = @startContainer
            offsetA = @startOffset
          when Range.END_TO_END, Range.END_TO_START
            containerA = @endContainer
            offsetA = @endOffset
        switch how
          when Range.START_TO_START, Range.END_TO_START
            containerB = sourceRange.startContainer
            offsetB = sourceRange.startOffset
          when Range.START_TO_END, Range.END_TO_END
            containerB = sourceRange.endContainer
            offsetB = sourceRange.endOffset
        (if containerA.sourceIndex < containerB.sourceIndex then -1 else (if containerA.sourceIndex is containerB.sourceIndex then (if offsetA < offsetB then -1 else (if offsetA is offsetB then 0 else 1)) else 1))

      cloneRange: ->
        range = new Range(@_document)
        range.setStart @startContainer, @startOffset
        range.setEnd @endContainer, @endOffset
        range

      detach: ->

      toString: ->
        @_toTextRange().text

      createContextualFragment: (tagString) ->
        content = ((if DOMUtils.isDataNode(@startContainer) then @startContainer.parentNode else @startContainer)).cloneNode(false)
        content.innerHTML = tagString
        fragment = @_document.createDocumentFragment()

        while content.firstChild
          fragment.appendChild content.firstChild
        fragment

    RangeIterator:: =
      range: null
      _current: null
      _next: null
      _end: null
      hasNext: ->
        !!@_next

      next: ->

        # move to next node
        current = @_current = @_next
        @_next = (if @_current and @_current.nextSibling isnt @_end then @_current.nextSibling else null)

        # check for partial text nodes
        if DOMUtils.isDataNode(@_current)
          (current = current.cloneNode(true)).deleteData @range.endOffset, current.length - @range.endOffset  if @range.endContainer is @_current
          (current = current.cloneNode(true)).deleteData 0, @range.startOffset  if @range.startContainer is @_current
        current

      remove: ->

        # check for partial text nodes
        if DOMUtils.isDataNode(@_current) and (@range.startContainer is @_current or @range.endContainer is @_current)
          start = (if @range.startContainer is @_current then @range.startOffset else 0)
          end = (if @range.endContainer is @_current then @range.endOffset else @_current.length)
          @_current.deleteData start, end - start
        else
          @_current.parentNode.removeChild @_current

      hasPartialSubtree: ->

        # check if this node be partially selected
        not DOMUtils.isDataNode(@_current) and (DOMUtils.isAncestorOrSelf(@_current, @range.startContainer) or DOMUtils.isAncestorOrSelf(@_current, @range.endContainer))

      getSubtreeIterator: ->

        # create a new range
        subRange = new Range(@range._document)
        subRange.selectNodeContents @_current

        # handle anchor points
        subRange.setStart @range.startContainer, @range.startOffset  if DOMUtils.isAncestorOrSelf(@_current, @range.startContainer)
        subRange.setEnd @range.endContainer, @range.endOffset  if DOMUtils.isAncestorOrSelf(@_current, @range.endContainer)

        # return iterator
        new RangeIterator(subRange)

    Range
  )()
  window.Range._fromTextRange = (textRange, document) ->
    adoptBoundary = (domRange, textRange, bStart) ->

      # iterate backwards through parent element to find anchor location
      cursorNode = document.createElement("a")
      cursor = textRange.duplicate()
      cursor.collapse bStart
      parent = cursor.parentElement()
      loop
        parent.insertBefore cursorNode, cursorNode.previousSibling
        cursor.moveToElementText cursorNode
        break unless cursor.compareEndPoints((if bStart then "StartToStart" else "StartToEnd"), textRange) > 0 and cursorNode.previousSibling

      # when we exceed or meet the cursor, we've found the node
      if cursor.compareEndPoints((if bStart then "StartToStart" else "StartToEnd"), textRange) is -1 and cursorNode.nextSibling

        # data node
        cursor.setEndPoint (if bStart then "EndToStart" else "EndToEnd"), textRange
        domRange[(if bStart then "setStart" else "setEnd")] cursorNode.nextSibling, cursor.text.length
      else

        # element
        domRange[(if bStart then "setStartBefore" else "setEndBefore")] cursorNode
      cursorNode.parentNode.removeChild cursorNode

    # return a DOM range
    domRange = new Range(document)
    adoptBoundary domRange, textRange, true
    adoptBoundary domRange, textRange, false
    domRange

  document.createRange = ->
    new Range(document)

  window.Selection = (->
    Selection = (document) ->
      @_document = document
      selection = this
      document.attachEvent "onselectionchange", ->
        selection._selectionChangeHandler()

    Selection:: =
      rangeCount: 0
      _document: null
      _selectionChangeHandler: ->
        @rangeCount = (if @_selectionExists(@_document.selection.createRange()) then 1 else 0)

      _selectionExists: (textRange) ->
        textRange.compareEndPoints("StartToEnd", textRange) isnt 0 or textRange.parentElement().isContentEditable

      addRange: (range) ->
        selection = @_document.selection.createRange()
        textRange = range._toTextRange()
        unless @_selectionExists(selection)
          textRange.select()
        else

          # only modify range if it intersects with current range
          if textRange.compareEndPoints("StartToStart", selection) is -1
            if textRange.compareEndPoints("StartToEnd", selection) > -1 and textRange.compareEndPoints("EndToEnd", selection) is -1
              selection.setEndPoint "StartToStart", textRange
            else selection.setEndPoint "EndToEnd", textRange  if textRange.compareEndPoints("EndToStart", selection) < 1 and textRange.compareEndPoints("EndToEnd", selection) > -1
          selection.select()

      removeAllRanges: ->
        @_document.selection.empty()

      getRangeAt: (index) ->
        textRange = @_document.selection.createRange()
        return Range._fromTextRange(textRange, @_document)  if @_selectionExists(textRange)
        null

      toString: ->
        @_document.selection.createRange().text

    Selection
  )()
  window.getSelection = (->
    selection = new Selection(document)
    ->
      selection
  )()