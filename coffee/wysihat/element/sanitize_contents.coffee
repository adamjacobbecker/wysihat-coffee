(->
  cloneWithAllowedAttributes = (element, allowedAttributes) ->
    length = allowedAttributes.length
    i = undefined
    result = $("<" + element.tagName.toLowerCase() + "></" + element.tagName.toLowerCase() + ">")
    element = $(element)
    i = 0
    while i < allowedAttributes.length
      attribute = allowedAttributes[i]
      result.attr attribute, element.attr(attribute)  if element.attr(attribute)
      i++
    result
  withEachChildNodeOf = (element, callback) ->
    nodes = $(element).children
    length = nodes.length
    i = undefined
    i = 0
    while i < length
      callback nodes[i]
      i++
  sanitizeNode = (node, tagsToRemove, tagsToAllow, tagsToSkip) ->
    parentNode = node.parentNode
    switch node.nodeType
      when Node.ELEMENT_NODE
        tagName = node.tagName.toLowerCase()
        if tagsToSkip
          newNode = node.cloneNode(false)
          withEachChildNodeOf node, (childNode) ->
            newNode.appendChild childNode
            sanitizeNode childNode, tagsToRemove, tagsToAllow, tagsToSkip

          parentNode.insertBefore newNode, node
        else if tagName of tagsToAllow
          newNode = cloneWithAllowedAttributes(node, tagsToAllow[tagName])
          withEachChildNodeOf node, (childNode) ->
            newNode.appendChild childNode
            sanitizeNode childNode, tagsToRemove, tagsToAllow, tagsToSkip

          parentNode.insertBefore newNode, node
        else unless tagName of tagsToRemove
          withEachChildNodeOf node, (childNode) ->
            parentNode.insertBefore childNode, node
            sanitizeNode childNode, tagsToRemove, tagsToAllow, tagsToSkip

      when Node.COMMENT_NODE
        parentNode.removeChild node
  jQuery.fn.sanitizeContents = (options) ->
    element = $(this)
    tagsToRemove = {}
    $.each (options.remove or "").split(","), (tagName) ->
      tagsToRemove[$.trim(tagName)] = true

    tagsToAllow = {}
    $.each (options.allow or "").split(","), (selector) ->
      parts = $.trim(selector).split(/[\[\]]/)
      tagName = parts[0]
      allowedAttributes = $.grep(parts.slice(1), (n, i) ->
        /./.test n
      )
      tagsToAllow[tagName] = allowedAttributes

    tagsToSkip = options.skip
    withEachChildNodeOf element, (childNode) ->
      sanitizeNode childNode, tagsToRemove, tagsToAllow, tagsToSkip

    element
)()