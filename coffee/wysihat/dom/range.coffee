jQuery.extend Range::, (->
  beforeRange = (range) ->
    return false  if not range or not range.compareBoundaryPoints
    @compareBoundaryPoints(@START_TO_START, range) is -1 and @compareBoundaryPoints(@START_TO_END, range) is -1 and @compareBoundaryPoints(@END_TO_END, range) is -1 and @compareBoundaryPoints(@END_TO_START, range) is -1
  afterRange = (range) ->
    return false  if not range or not range.compareBoundaryPoints
    @compareBoundaryPoints(@START_TO_START, range) is 1 and @compareBoundaryPoints(@START_TO_END, range) is 1 and @compareBoundaryPoints(@END_TO_END, range) is 1 and @compareBoundaryPoints(@END_TO_START, range) is 1
  betweenRange = (range) ->
    return false  if not range or not range.compareBoundaryPoints
    not (@beforeRange(range) or @afterRange(range))
  equalRange = (range) ->
    return false  if not range or not range.compareBoundaryPoints
    @compareBoundaryPoints(@START_TO_START, range) is 0 and @compareBoundaryPoints(@START_TO_END, range) is 1 and @compareBoundaryPoints(@END_TO_END, range) is 0 and @compareBoundaryPoints(@END_TO_START, range) is -1
  getNode = ->
    parent = @commonAncestorContainer
    parent = parent.parentNode  while parent.nodeType is Node.TEXT_NODE
    child = undefined
    that = this
    $.each parent.children, (index, child) ->
      range = document.createRange()
      range.selectNodeContents child
      child = that.betweenRange(range)

    $ child or parent
  beforeRange: beforeRange
  afterRange: afterRange
  betweenRange: betweenRange
  equalRange: equalRange
  getNode: getNode
)()