
WysiHat.Formatting = (function() {
  var ACCUMULATING_LINE, ACCUMULATING_LIST_ITEM, EXPECTING_LIST_ITEM;
  ACCUMULATING_LINE = {};
  EXPECTING_LIST_ITEM = {};
  ACCUMULATING_LIST_ITEM = {};
  return {
    getBrowserMarkupFrom: function(applicationMarkup) {
      var container, convertDivsToParagraphs, convertEmsToSpans, convertStrongsToSpans, spanify;
      spanify = function(element, style) {
        return $(element).replaceWith("<span style=\"" + style + "\" class=\"Apple-style-span\">" + element.innerHTML + "</span>");
      };
      convertStrongsToSpans = function() {
        return container.find("strong").each(function(index, element) {
          return spanify(element, "font-weight: bold");
        });
      };
      convertEmsToSpans = function() {
        return container.find("em").each(function(index, element) {
          return spanify(element, "font-style: italic");
        });
      };
      convertDivsToParagraphs = function() {
        return container.find("div").each(function(index, element) {
          return $(element).replaceWith("<p>" + element.innerHTML + "</p>");
        });
      };
      container = $("<div>" + applicationMarkup + "</div>");
      if ($.browser.webkit || $.browser.mozilla) {
        convertStrongsToSpans();
        convertEmsToSpans();
      } else {
        if ($.browser.msie || $.browser.opera) {
          convertDivsToParagraphs();
        }
      }
      return container.html();
    },
    getApplicationMarkupFrom: function($element) {
      var accumulate, accumulateInlineElement, close, container, createLine, element, flush, getPreviouslyAccumulatedTagName, insertList, isBlockElement, isEmptyParagraph, isLineBreak, isLineElement, isListElement, isListItemElement, line, lineContainer, mode, open, previousAccumulation, read, result, walk;
      walk = function(nodes) {
        var i, length, node, tagName, _results;
        length = nodes.length;
        node = void 0;
        tagName = void 0;
        i = void 0;
        i = 0;
        _results = [];
        while (i < length) {
          node = nodes[i];
          if (node.nodeType === 1) {
            tagName = node.tagName.toLowerCase();
            open(tagName, node);
            walk(node.childNodes);
            close(tagName);
          } else {
            if (node.nodeType === 3) {
              read(node.nodeValue);
            }
          }
          _results.push(i++);
        }
        return _results;
      };
      open = function(tagName, node) {
        var container, mode;
        if (mode === ACCUMULATING_LINE) {
          if (isBlockElement(tagName)) {
            if (isEmptyParagraph(node)) {
              accumulate($("<br />").get(0));
            }
            flush();
            if (isListElement(tagName)) {
              container = insertList(tagName);
              return mode = EXPECTING_LIST_ITEM;
            }
          } else if (isLineBreak(tagName)) {
            if (isLineBreak(getPreviouslyAccumulatedTagName())) {
              previousAccumulation.parentNode.removeChild(previousAccumulation);
              flush();
            }
            accumulate(node.cloneNode(false));
            if (!previousAccumulation.previousNode) {
              return flush();
            }
          } else {
            return accumulateInlineElement(tagName, node);
          }
        } else if (mode === EXPECTING_LIST_ITEM) {
          if (isListItemElement(tagName)) {
            return mode = ACCUMULATING_LIST_ITEM;
          }
        } else if (mode === ACCUMULATING_LIST_ITEM) {
          if (isLineBreak(tagName)) {
            return accumulate(node.cloneNode(false));
          } else {
            if (!isBlockElement(tagName)) {
              return accumulateInlineElement(tagName, node);
            }
          }
        }
      };
      close = function(tagName) {
        var container, lineContainer, mode;
        if (mode === ACCUMULATING_LINE) {
          if (isLineElement(tagName)) {
            flush();
          }
          if (line !== lineContainer) {
            return lineContainer = lineContainer.parentNode;
          }
        } else if (mode === EXPECTING_LIST_ITEM) {
          if (isListElement(tagName)) {
            container = result;
            return mode = ACCUMULATING_LINE;
          }
        } else if (mode === ACCUMULATING_LIST_ITEM) {
          if (isListItemElement(tagName)) {
            flush();
            mode = EXPECTING_LIST_ITEM;
          }
          if (line !== lineContainer) {
            return lineContainer = lineContainer.parentNode;
          }
        }
      };
      isBlockElement = function(tagName) {
        return isLineElement(tagName) || isListElement(tagName);
      };
      isLineElement = function(tagName) {
        return tagName === "p" || tagName === "div";
      };
      isListElement = function(tagName) {
        return tagName === "ol" || tagName === "ul";
      };
      isListItemElement = function(tagName) {
        return tagName === "li";
      };
      isLineBreak = function(tagName) {
        return tagName === "br";
      };
      isEmptyParagraph = function(node) {
        return node.tagName.toLowerCase() === "p" && node.childNodes.length === 0;
      };
      read = function(value) {
        return accumulate(document.createTextNode(value));
      };
      accumulateInlineElement = function(tagName, node) {
        var element, lineContainer;
        element = node.cloneNode(false);
        if (tagName === "span") {
          if ($(node).css("fontWeight") === "bold") {
            element = $("<strong></strong>").get(0);
          } else {
            if ($(node).css("fontStyle") === "italic") {
              element = $("<em></em>").get(0);
            }
          }
        }
        accumulate(element);
        return lineContainer = element;
      };
      accumulate = function(node) {
        var line, lineContainer, previousAccumulation;
        if (mode !== EXPECTING_LIST_ITEM) {
          if (!line) {
            line = lineContainer = createLine();
          }
          previousAccumulation = node;
          return lineContainer.appendChild(node);
        }
      };
      getPreviouslyAccumulatedTagName = function() {
        if (previousAccumulation && previousAccumulation.nodeType === 1) {
          return previousAccumulation.tagName.toLowerCase();
        }
      };
      flush = function() {
        var line, lineContainer;
        if (line && line.childNodes.length) {
          container.appendChild(line);
          return line = lineContainer = null;
        }
      };
      createLine = function() {
        if (mode === ACCUMULATING_LINE) {
          return $("<div></div>").get(0);
        } else {
          if (mode === ACCUMULATING_LIST_ITEM) {
            return $("<li></li>").get(0);
          }
        }
      };
      insertList = function(tagName) {
        var list;
        list = $("<" + tagName + "></" + tagName + ">").get(0);
        result.appendChild(list);
        return list;
      };
      element = $element.get(0);
      mode = ACCUMULATING_LINE;
      result = void 0;
      container = void 0;
      line = void 0;
      lineContainer = void 0;
      previousAccumulation = void 0;
      result = container = $("<div></div>").get(0);
      walk(element.childNodes);
      flush();
      return result.innerHTML;
    }
  };
})();
