
(function() {
  var cloneWithAllowedAttributes, sanitizeNode, withEachChildNodeOf;
  cloneWithAllowedAttributes = function(element, allowedAttributes) {
    var attribute, i, length, result;
    length = allowedAttributes.length;
    i = void 0;
    result = $("<" + element.tagName.toLowerCase() + "></" + element.tagName.toLowerCase() + ">");
    element = $(element);
    i = 0;
    while (i < allowedAttributes.length) {
      attribute = allowedAttributes[i];
      if (element.attr(attribute)) {
        result.attr(attribute, element.attr(attribute));
      }
      i++;
    }
    return result;
  };
  withEachChildNodeOf = function(element, callback) {
    var i, length, nodes, _results;
    nodes = $(element).children;
    length = nodes.length;
    i = void 0;
    i = 0;
    _results = [];
    while (i < length) {
      callback(nodes[i]);
      _results.push(i++);
    }
    return _results;
  };
  sanitizeNode = function(node, tagsToRemove, tagsToAllow, tagsToSkip) {
    var newNode, parentNode, tagName;
    parentNode = node.parentNode;
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        tagName = node.tagName.toLowerCase();
        if (tagsToSkip) {
          newNode = node.cloneNode(false);
          withEachChildNodeOf(node, function(childNode) {
            newNode.appendChild(childNode);
            return sanitizeNode(childNode, tagsToRemove, tagsToAllow, tagsToSkip);
          });
          return parentNode.insertBefore(newNode, node);
        } else if (tagName in tagsToAllow) {
          newNode = cloneWithAllowedAttributes(node, tagsToAllow[tagName]);
          withEachChildNodeOf(node, function(childNode) {
            newNode.appendChild(childNode);
            return sanitizeNode(childNode, tagsToRemove, tagsToAllow, tagsToSkip);
          });
          return parentNode.insertBefore(newNode, node);
        } else if (!(tagName in tagsToRemove)) {
          return withEachChildNodeOf(node, function(childNode) {
            parentNode.insertBefore(childNode, node);
            return sanitizeNode(childNode, tagsToRemove, tagsToAllow, tagsToSkip);
          });
        }
        break;
      case Node.COMMENT_NODE:
        return parentNode.removeChild(node);
    }
  };
  return jQuery.fn.sanitizeContents = function(options) {
    var element, tagsToAllow, tagsToRemove, tagsToSkip;
    element = $(this);
    tagsToRemove = {};
    $.each((options.remove || "").split(","), function(tagName) {
      return tagsToRemove[$.trim(tagName)] = true;
    });
    tagsToAllow = {};
    $.each((options.allow || "").split(","), function(selector) {
      var allowedAttributes, parts, tagName;
      parts = $.trim(selector).split(/[\[\]]/);
      tagName = parts[0];
      allowedAttributes = $.grep(parts.slice(1), function(n, i) {
        return /./.test(n);
      });
      return tagsToAllow[tagName] = allowedAttributes;
    });
    tagsToSkip = options.skip;
    withEachChildNodeOf(element, function(childNode) {
      return sanitizeNode(childNode, tagsToRemove, tagsToAllow, tagsToSkip);
    });
    return element;
  };
})();
