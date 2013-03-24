var WysiHat;

WysiHat = {};

$.fn.wysihat = function() {
  var result;
  result = void 0;
  return this.each(function() {
    var $editor;
    $editor = WysiHat.Editor.attach($(this));
    $editor.toolbar = new WysiHat.Toolbar($editor);
    return $(this).data('wysihat', result);
  });
};

var DOMUtils;

if (!window.getSelection) {
  DOMUtils = {
    isDataNode: function(node) {
      try {
        return node && node.nodeValue !== null && node.data !== null;
      } catch (e) {
        return false;
      }
    },
    isAncestorOf: function(parent, node) {
      if (!parent) {
        return false;
      }
      return !DOMUtils.isDataNode(parent) && (parent.contains((DOMUtils.isDataNode(node) ? node.parentNode : node)) || node.parentNode === parent);
    },
    isAncestorOrSelf: function(root, node) {
      return DOMUtils.isAncestorOf(root, node) || root === node;
    },
    findClosestAncestor: function(root, node) {
      if (DOMUtils.isAncestorOf(root, node)) {
        while (node && node.parentNode !== root) {
          node = node.parentNode;
        }
      }
      return node;
    },
    getNodeLength: function(node) {
      if (DOMUtils.isDataNode(node)) {
        return node.length;
      } else {
        return node.childNodes.length;
      }
    },
    splitDataNode: function(node, offset) {
      var newNode;
      if (!DOMUtils.isDataNode(node)) {
        return false;
      }
      newNode = node.cloneNode(false);
      node.deleteData(offset, node.length);
      newNode.deleteData(0, offset);
      return node.parentNode.insertBefore(newNode, node.nextSibling);
    }
  };
  window.Range = (function() {
    var Range, RangeIterator, findChildPosition;
    Range = function(document) {
      this._document = document;
      this.startContainer = this.endContainer = document.body;
      return this.endOffset = DOMUtils.getNodeLength(document.body);
    };
    findChildPosition = function(node) {
      var i;
      i = 0;
      while (node = node.previousSibling) {
        continue;
        i++;
      }
      return i;
    };
    RangeIterator = function(range) {
      var root;
      this.range = range;
      if (range.collapsed) {
        return;
      }
      root = range.commonAncestorContainer;
      this._next = (range.startContainer === root && !DOMUtils.isDataNode(range.startContainer) ? range.startContainer.childNodes[range.startOffset] : DOMUtils.findClosestAncestor(root, range.startContainer));
      return this._end = (range.endContainer === root && !DOMUtils.isDataNode(range.endContainer) ? range.endContainer.childNodes[range.endOffset] : DOMUtils.findClosestAncestor(root, range.endContainer).nextSibling);
    };
    Range.START_TO_START = 0;
    Range.START_TO_END = 1;
    Range.END_TO_END = 2;
    Range.END_TO_START = 3;
    Range.prototype = {
      startContainer: null,
      startOffset: 0,
      endContainer: null,
      endOffset: 0,
      commonAncestorContainer: null,
      collapsed: false,
      _document: null,
      _toTextRange: function() {
        var adoptEndPoint, textRange;
        adoptEndPoint = function(textRange, domRange, bStart) {
          var anchorNode, anchorParent, container, cursor, cursorNode, offset, textOffset;
          container = domRange[(bStart ? "startContainer" : "endContainer")];
          offset = domRange[(bStart ? "startOffset" : "endOffset")];
          textOffset = 0;
          anchorNode = (DOMUtils.isDataNode(container) ? container : container.childNodes[offset]);
          anchorParent = (DOMUtils.isDataNode(container) ? container.parentNode : container);
          if (container.nodeType === 3 || container.nodeType === 4) {
            textOffset = offset;
          }
          cursorNode = domRange._document.createElement("a");
          if (anchorNode) {
            anchorParent.insertBefore(cursorNode, anchorNode);
          } else {
            anchorParent.appendChild(cursorNode);
          }
          cursor = domRange._document.body.createTextRange();
          cursor.moveToElementText(cursorNode);
          cursorNode.parentNode.removeChild(cursorNode);
          textRange.setEndPoint((bStart ? "StartToStart" : "EndToStart"), cursor);
          return textRange[(bStart ? "moveStart" : "moveEnd")]("character", textOffset);
        };
        textRange = this._document.body.createTextRange();
        adoptEndPoint(textRange, this, true);
        adoptEndPoint(textRange, this, false);
        return textRange;
      },
      _refreshProperties: function() {
        var node;
        this.collapsed = this.startContainer === this.endContainer && this.startOffset === this.endOffset;
        node = this.startContainer;
        while (node && node !== this.endContainer && !DOMUtils.isAncestorOf(node, this.endContainer)) {
          node = node.parentNode;
        }
        return this.commonAncestorContainer = node;
      },
      setStart: function(container, offset) {
        this.startContainer = container;
        this.startOffset = offset;
        return this._refreshProperties();
      },
      setEnd: function(container, offset) {
        this.endContainer = container;
        this.endOffset = offset;
        return this._refreshProperties();
      },
      setStartBefore: function(refNode) {
        return this.setStart(refNode.parentNode, findChildPosition(refNode));
      },
      setStartAfter: function(refNode) {
        return this.setStart(refNode.parentNode, findChildPosition(refNode) + 1);
      },
      setEndBefore: function(refNode) {
        return this.setEnd(refNode.parentNode, findChildPosition(refNode));
      },
      setEndAfter: function(refNode) {
        return this.setEnd(refNode.parentNode, findChildPosition(refNode) + 1);
      },
      selectNode: function(refNode) {
        this.setStartBefore(refNode);
        return this.setEndAfter(refNode);
      },
      selectNodeContents: function(refNode) {
        this.setStart(refNode, 0);
        return this.setEnd(refNode, DOMUtils.getNodeLength(refNode));
      },
      collapse: function(toStart) {
        if (toStart) {
          return this.setEnd(this.startContainer, this.startOffset);
        } else {
          return this.setStart(this.endContainer, this.endOffset);
        }
      },
      cloneContents: function() {
        var cloneSubtree;
        return (cloneSubtree = function(iterator) {
          var frag, node;
          node = void 0;
          frag = document.createDocumentFragment();
          while (node = iterator.next()) {
            node = node.cloneNode(!iterator.hasPartialSubtree());
            if (iterator.hasPartialSubtree()) {
              node.appendChild(cloneSubtree(iterator.getSubtreeIterator()));
            }
            frag.appendChild(node);
          }
          return frag;
        })(new RangeIterator(this));
      },
      extractContents: function() {
        var extractSubtree, range;
        range = this.cloneRange();
        if (this.startContainer !== this.commonAncestorContainer) {
          this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
        }
        this.collapse(true);
        return (extractSubtree = function(iterator) {
          var frag, node;
          node = void 0;
          frag = document.createDocumentFragment();
          while (node = iterator.next()) {
            if (iterator.hasPartialSubtree()) {
              node = node.cloneNode(false);
            } else {
              iterator.remove();
            }
            if (iterator.hasPartialSubtree()) {
              node.appendChild(extractSubtree(iterator.getSubtreeIterator()));
            }
            frag.appendChild(node);
          }
          return frag;
        })(new RangeIterator(range));
      },
      deleteContents: function() {
        var deleteSubtree, range;
        range = this.cloneRange();
        if (this.startContainer !== this.commonAncestorContainer) {
          this.setStartAfter(DOMUtils.findClosestAncestor(this.commonAncestorContainer, this.startContainer));
        }
        this.collapse(true);
        return (deleteSubtree = function(iterator) {
          var _results;
          _results = [];
          while (iterator.next()) {
            _results.push(iterator.hasPartialSubtree() ? deleteSubtree(iterator.getSubtreeIterator()) : iterator.remove());
          }
          return _results;
        })(new RangeIterator(range));
      },
      insertNode: function(newNode) {
        var offsetNode;
        if (DOMUtils.isDataNode(this.startContainer)) {
          DOMUtils.splitDataNode(this.startContainer, this.startOffset);
          this.startContainer.parentNode.insertBefore(newNode, this.startContainer.nextSibling);
        } else {
          offsetNode = this.startContainer.childNodes[this.startOffset];
          if (offsetNode) {
            this.startContainer.insertBefore(newNode, offsetNode);
          } else {
            this.startContainer.appendChild(newNode);
          }
        }
        return this.setStart(this.startContainer, this.startOffset);
      },
      surroundContents: function(newNode) {
        var content;
        content = this.extractContents();
        this.insertNode(newNode);
        newNode.appendChild(content);
        return this.selectNode(newNode);
      },
      compareBoundaryPoints: function(how, sourceRange) {
        var containerA, containerB, offsetA, offsetB;
        containerA = void 0;
        offsetA = void 0;
        containerB = void 0;
        offsetB = void 0;
        switch (how) {
          case Range.START_TO_START:
          case Range.START_TO_END:
            containerA = this.startContainer;
            offsetA = this.startOffset;
            break;
          case Range.END_TO_END:
          case Range.END_TO_START:
            containerA = this.endContainer;
            offsetA = this.endOffset;
        }
        switch (how) {
          case Range.START_TO_START:
          case Range.END_TO_START:
            containerB = sourceRange.startContainer;
            offsetB = sourceRange.startOffset;
            break;
          case Range.START_TO_END:
          case Range.END_TO_END:
            containerB = sourceRange.endContainer;
            offsetB = sourceRange.endOffset;
        }
        if (containerA.sourceIndex < containerB.sourceIndex) {
          return -1;
        } else {
          if (containerA.sourceIndex === containerB.sourceIndex) {
            if (offsetA < offsetB) {
              return -1;
            } else {
              if (offsetA === offsetB) {
                return 0;
              } else {
                return 1;
              }
            }
          } else {
            return 1;
          }
        }
      },
      cloneRange: function() {
        var range;
        range = new Range(this._document);
        range.setStart(this.startContainer, this.startOffset);
        range.setEnd(this.endContainer, this.endOffset);
        return range;
      },
      detach: function() {},
      toString: function() {
        return this._toTextRange().text;
      },
      createContextualFragment: function(tagString) {
        var content, fragment;
        content = (DOMUtils.isDataNode(this.startContainer) ? this.startContainer.parentNode : this.startContainer).cloneNode(false);
        content.innerHTML = tagString;
        fragment = this._document.createDocumentFragment();
        while (content.firstChild) {
          fragment.appendChild(content.firstChild);
        }
        return fragment;
      }
    };
    RangeIterator.prototype = {
      range: null,
      _current: null,
      _next: null,
      _end: null,
      hasNext: function() {
        return !!this._next;
      },
      next: function() {
        var current;
        current = this._current = this._next;
        this._next = (this._current && this._current.nextSibling !== this._end ? this._current.nextSibling : null);
        if (DOMUtils.isDataNode(this._current)) {
          if (this.range.endContainer === this._current) {
            (current = current.cloneNode(true)).deleteData(this.range.endOffset, current.length - this.range.endOffset);
          }
          if (this.range.startContainer === this._current) {
            (current = current.cloneNode(true)).deleteData(0, this.range.startOffset);
          }
        }
        return current;
      },
      remove: function() {
        var end, start;
        if (DOMUtils.isDataNode(this._current) && (this.range.startContainer === this._current || this.range.endContainer === this._current)) {
          start = (this.range.startContainer === this._current ? this.range.startOffset : 0);
          end = (this.range.endContainer === this._current ? this.range.endOffset : this._current.length);
          return this._current.deleteData(start, end - start);
        } else {
          return this._current.parentNode.removeChild(this._current);
        }
      },
      hasPartialSubtree: function() {
        return !DOMUtils.isDataNode(this._current) && (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer) || DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer));
      },
      getSubtreeIterator: function() {
        var subRange;
        subRange = new Range(this.range._document);
        subRange.selectNodeContents(this._current);
        if (DOMUtils.isAncestorOrSelf(this._current, this.range.startContainer)) {
          subRange.setStart(this.range.startContainer, this.range.startOffset);
        }
        if (DOMUtils.isAncestorOrSelf(this._current, this.range.endContainer)) {
          subRange.setEnd(this.range.endContainer, this.range.endOffset);
        }
        return new RangeIterator(subRange);
      }
    };
    return Range;
  })();
  window.Range._fromTextRange = function(textRange, document) {
    var adoptBoundary, domRange;
    adoptBoundary = function(domRange, textRange, bStart) {
      var cursor, cursorNode, parent;
      cursorNode = document.createElement("a");
      cursor = textRange.duplicate();
      cursor.collapse(bStart);
      parent = cursor.parentElement();
      while (true) {
        parent.insertBefore(cursorNode, cursorNode.previousSibling);
        cursor.moveToElementText(cursorNode);
        if (!(cursor.compareEndPoints((bStart ? "StartToStart" : "StartToEnd"), textRange) > 0 && cursorNode.previousSibling)) {
          break;
        }
      }
      if (cursor.compareEndPoints((bStart ? "StartToStart" : "StartToEnd"), textRange) === -1 && cursorNode.nextSibling) {
        cursor.setEndPoint((bStart ? "EndToStart" : "EndToEnd"), textRange);
        domRange[(bStart ? "setStart" : "setEnd")](cursorNode.nextSibling, cursor.text.length);
      } else {
        domRange[(bStart ? "setStartBefore" : "setEndBefore")](cursorNode);
      }
      return cursorNode.parentNode.removeChild(cursorNode);
    };
    domRange = new Range(document);
    adoptBoundary(domRange, textRange, true);
    adoptBoundary(domRange, textRange, false);
    return domRange;
  };
  document.createRange = function() {
    return new Range(document);
  };
  window.Selection = (function() {
    var Selection;
    Selection = function(document) {
      var selection;
      this._document = document;
      selection = this;
      return document.attachEvent("onselectionchange", function() {
        return selection._selectionChangeHandler();
      });
    };
    Selection.prototype = {
      rangeCount: 0,
      _document: null,
      _selectionChangeHandler: function() {
        return this.rangeCount = (this._selectionExists(this._document.selection.createRange()) ? 1 : 0);
      },
      _selectionExists: function(textRange) {
        return textRange.compareEndPoints("StartToEnd", textRange) !== 0 || textRange.parentElement().isContentEditable;
      },
      addRange: function(range) {
        var selection, textRange;
        selection = this._document.selection.createRange();
        textRange = range._toTextRange();
        if (!this._selectionExists(selection)) {
          return textRange.select();
        } else {
          if (textRange.compareEndPoints("StartToStart", selection) === -1) {
            if (textRange.compareEndPoints("StartToEnd", selection) > -1 && textRange.compareEndPoints("EndToEnd", selection) === -1) {
              selection.setEndPoint("StartToStart", textRange);
            } else {
              if (textRange.compareEndPoints("EndToStart", selection) < 1 && textRange.compareEndPoints("EndToEnd", selection) > -1) {
                selection.setEndPoint("EndToEnd", textRange);
              }
            }
          }
          return selection.select();
        }
      },
      removeAllRanges: function() {
        return this._document.selection.empty();
      },
      getRangeAt: function(index) {
        var textRange;
        textRange = this._document.selection.createRange();
        if (this._selectionExists(textRange)) {
          return Range._fromTextRange(textRange, this._document);
        }
        return null;
      },
      toString: function() {
        return this._document.selection.createRange().text;
      }
    };
    return Selection;
  })();
  window.getSelection = (function() {
    var selection;
    selection = new Selection(document);
    return function() {
      return selection;
    };
  })();
}


jQuery.extend(Range.prototype, (function() {
  var afterRange, beforeRange, betweenRange, equalRange, getNode;
  beforeRange = function(range) {
    if (!range || !range.compareBoundaryPoints) {
      return false;
    }
    return this.compareBoundaryPoints(this.START_TO_START, range) === -1 && this.compareBoundaryPoints(this.START_TO_END, range) === -1 && this.compareBoundaryPoints(this.END_TO_END, range) === -1 && this.compareBoundaryPoints(this.END_TO_START, range) === -1;
  };
  afterRange = function(range) {
    if (!range || !range.compareBoundaryPoints) {
      return false;
    }
    return this.compareBoundaryPoints(this.START_TO_START, range) === 1 && this.compareBoundaryPoints(this.START_TO_END, range) === 1 && this.compareBoundaryPoints(this.END_TO_END, range) === 1 && this.compareBoundaryPoints(this.END_TO_START, range) === 1;
  };
  betweenRange = function(range) {
    if (!range || !range.compareBoundaryPoints) {
      return false;
    }
    return !(this.beforeRange(range) || this.afterRange(range));
  };
  equalRange = function(range) {
    if (!range || !range.compareBoundaryPoints) {
      return false;
    }
    return this.compareBoundaryPoints(this.START_TO_START, range) === 0 && this.compareBoundaryPoints(this.START_TO_END, range) === 1 && this.compareBoundaryPoints(this.END_TO_END, range) === 0 && this.compareBoundaryPoints(this.END_TO_START, range) === -1;
  };
  getNode = function() {
    var child, parent, that;
    parent = this.commonAncestorContainer;
    while (parent.nodeType === Node.TEXT_NODE) {
      parent = parent.parentNode;
    }
    child = void 0;
    that = this;
    $.each(parent.children, function(index, child) {
      var range;
      range = document.createRange();
      range.selectNodeContents(child);
      return child = that.betweenRange(range);
    });
    return $(child || parent);
  };
  return {
    beforeRange: beforeRange,
    afterRange: afterRange,
    betweenRange: betweenRange,
    equalRange: equalRange,
    getNode: getNode
  };
})());

var Selection;

if (jQuery.browser.msie && jQuery.browser.version < 9.0) {
  jQuery.extend(Selection.prototype, (function() {
    var getNode, selectNode;
    getNode = function() {
      var range;
      range = this._document.selection.createRange();
      return jQuery(range.parentElement());
    };
    selectNode = function(element) {
      var range;
      range = this._document.body.createTextRange();
      range.moveToElementText(element);
      return range.select();
    };
    return {
      getNode: getNode,
      selectNode: selectNode
    };
  })());
} else {
  if (typeof Selection === "undefined") {
    Selection = {};
    Selection.prototype = window.getSelection().__proto__;
  }
  jQuery.extend(Selection.prototype, (function() {
    var getNode, selectNode;
    getNode = function() {
      if (this.rangeCount > 0) {
        return this.getRangeAt(0).getNode();
      } else {
        return null;
      }
    };
    selectNode = function(element) {
      var range;
      range = document.createRange();
      range.selectNode(element[0]);
      this.removeAllRanges();
      return this.addRange(range);
    };
    return {
      getNode: getNode,
      selectNode: selectNode
    };
  })());
}


if (jQuery.browser.msie) {
  jQuery.extend(Selection.prototype, (function() {
    var moveToBookmark, setBookmark;
    setBookmark = function() {
      var bookmark, parent, range;
      bookmark = jQuery("#bookmark");
      if (bookmark) {
        bookmark.remove();
      }
      bookmark = jQuery("<span id=\"bookmark\">&nbsp;</span>");
      parent = jQuery("<div></div>").html(bookmark);
      range = this._document.selection.createRange();
      range.collapse();
      return range.pasteHTML(parent.html());
    };
    moveToBookmark = function() {
      var bookmark, range;
      bookmark = jQuery("#bookmark");
      if (!bookmark) {
        return;
      }
      range = this._document.selection.createRange();
      range.moveToElementText(bookmark);
      range.collapse();
      range.select();
      return bookmark.remove();
    };
    return {
      setBookmark: setBookmark,
      moveToBookmark: moveToBookmark
    };
  })());
} else {
  jQuery.extend(Selection.prototype, (function() {
    var moveToBookmark, setBookmark;
    setBookmark = function() {
      var bookmark;
      bookmark = jQuery("#bookmark");
      if (bookmark) {
        bookmark.remove();
      }
      bookmark = jQuery("<span id=\"bookmark\">&nbsp;</span>");
      return this.getRangeAt(0).insertNode(bookmark);
    };
    moveToBookmark = function() {
      var bookmark, range;
      bookmark = jQuery("#bookmark");
      if (!bookmark) {
        return;
      }
      range = document.createRange();
      range.setStartBefore(bookmark);
      this.removeAllRanges();
      this.addRange(range);
      return bookmark.remove();
    };
    return {
      setBookmark: setBookmark,
      moveToBookmark: moveToBookmark
    };
  })());
}

/*
section: wysihat
WysiHat.Editor
*/

/*
section: wysihat
WysiHat.Editor.attach(textarea) -> undefined
- $textarea (jQuery): a jQuery wrapped textarea that you want to convert
to a rich-text field.

Creates a new editor for the textarea.
*/

WysiHat.Editor = {
  attach: function($textarea) {
    var $editArea, id;
    id = $textarea.attr("id") + "_editor";
    $editArea = $textarea.siblings("#" + id).first();
    if ($editArea.length === 0) {
      $editArea = $("<div id=\"" + id + "\" class=\"editor\" contentEditable=\"true\"></div>");
      $textarea.before($editArea);
    }
    $editArea.html(WysiHat.Formatting.getBrowserMarkupFrom($textarea.val()));
    jQuery.extend($editArea, {
      commands: WysiHat.Commands,
      states: WysiHat.States,
      styleSelectors: WysiHat.StyleSelectors,
      execCommand: WysiHat.ExecCommand
    });
    $textarea.hide();
    $textarea.closest("form").submit(function() {
      return $textarea.val(WysiHat.Formatting.getApplicationMarkupFrom($editArea));
    });
    return $editArea;
  }
};


WysiHat.BrowserFeatures = (function() {
  var createTmpIframe, detectIndentType, detectParagraphType, features, run;
  createTmpIframe = function(callback) {
    var frame, frameDocument;
    frame = void 0;
    frameDocument = void 0;
    frame = $("<iframe></iframe>");
    frame.css({
      position: "absolute",
      left: "-1000px"
    });
    frame.onFrameLoaded(function() {
      if (typeof frame.contentDocument !== "undefined") {
        frameDocument = frame.contentDocument;
      } else {
        if (typeof frame.contentWindow !== "undefined" && typeof frame.contentWindow.document !== "undefined") {
          frameDocument = frame.contentWindow.document;
        }
      }
      frameDocument.designMode = "on";
      callback(frameDocument);
      return frame.remove();
    });
    return $(document.body).insert(frame);
  };
  detectParagraphType = function(document) {
    var element, tagName;
    document.body.innerHTML = "";
    document.execCommand("insertparagraph", false, null);
    tagName = void 0;
    element = document.body.childNodes[0];
    if (element && element.tagName) {
      tagName = element.tagName.toLowerCase();
    }
    if (tagName === "div") {
      return features.paragraphType = "div";
    } else if (document.body.innerHTML === "<p><br></p>") {
      return features.paragraphType = "br";
    } else {
      return features.paragraphType = "p";
    }
  };
  detectIndentType = function(document) {
    var element, tagName;
    document.body.innerHTML = "tab";
    document.execCommand("indent", false, null);
    tagName = void 0;
    element = document.body.childNodes[0];
    if (element && element.tagName) {
      tagName = element.tagName.toLowerCase();
    }
    return features.indentInsertsBlockquote = tagName === "blockquote";
  };
  features = {};
  features.run = run = function() {
    if (features.finished) {
      return;
    }
    return createTmpIframe(function(document) {
      detectParagraphType(document);
      detectIndentType(document);
      return features.finished = true;
    });
  };
  return features;
})();

/*
section: wysihat
mixin WysiHat.Commands

Methods will be mixed into the editor element. Most of these
methods will be used to bind to button clicks or key presses.

var editor = WysiHat.Editor.attach(textarea);
$('#bold_button').click(function(event) {
editor.boldSelection();
return false;
});

In this example, it is important to stop the click event so you don't
lose your current selection.
*/

WysiHat.StyleSelectors = {
  fontname: "fontFamily",
  fontsize: "fontSize",
  forecolor: "color",
  hilitecolor: "backgroundColor",
  backcolor: "backgroundColor"
};

WysiHat.ExecCommand = function(command, ui, value) {
  try {
    window.document.execCommand(command, ui, value);
  } catch (e) {
    return null;
  }
  return $(document.activeElement).trigger("field:change");
};

WysiHat.Commands = {
  bold: function() {
    return this.execCommand("bold", false, null);
  },
  underline: function() {
    return this.execCommand("underline", false, null);
  },
  italic: function() {
    return this.execCommand("italic", false, null);
  },
  strikethrough: function() {
    return this.execCommand("strikethrough", false, null);
  },
  indent: function() {
    var blockquote, node, range, selection;
    if ($.browser.mozilla) {
      selection = void 0;
      range = void 0;
      node = void 0;
      blockquote = void 0;
      selection = window.getSelection();
      range = selection.getRangeAt(0);
      node = selection.getNode();
      if (range.collapsed) {
        range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      blockquote = $("<blockquote></blockquote>");
      range = selection.getRangeAt(0);
      return range.surroundContents(blockquote);
    } else {
      return this.execCommand("indent", false, null);
    }
  },
  outdent: function() {
    return this.execCommand("outdent", false, null);
  },
  toggleIndentation: function() {
    if (this.indentSelected()) {
      return this.outdentSelection();
    } else {
      return this.indentSelection();
    }
  },
  fontSize: function(fontSize) {
    return this.execCommand("fontsize", false, fontSize);
  },
  color: function(color) {
    return this.execCommand("forecolor", false, color);
  },
  backgroundColor: function(color) {
    if ($.browser.mozilla) {
      return this.execCommand("hilitecolor", false, color);
    } else {
      return this.execCommand("backcolor", false, color);
    }
  },
  align: function(alignment) {
    return this.execCommand("justify" + alignment);
  },
  link: function(url) {
    return this.execCommand("createLink", false, url);
  },
  unlink: function() {
    var node;
    node = window.getSelection().getNode();
    if (this.linkSelected()) {
      window.getSelection().selectNode(node);
    }
    return this.execCommand("unlink", false, null);
  },
  /*
    WysiHat.Commands#formatblockSelection(element) -> undefined
    - element (String): the type of element you want to wrap your selection
    with (like 'h1' or 'p').
  
    Wraps the current selection in a header or paragraph.
  */

  formatblock: function(element) {
    return this.execCommand("formatblock", false, element);
  },
  /*
    WysiHat.Commands#toggleOrderedList() -> undefined
  
    Formats current selection as an ordered list. If the selection is empty
    a new list is inserted.
  
    If the selection is already a ordered list, the entire list
    will be toggled. However, toggling the last item of the list
    will only affect that item, not the entire list.
  */

  orderedList: function() {
    var node, selection;
    selection = void 0;
    node = void 0;
    selection = window.getSelection();
    node = selection.getNode();
    if (this.states.orderedList() && !node.is("ol li:last-child, ol li:last-child *")) {
      selection.selectNode(node.closest("ol"));
    } else {
      if (this.states.unorderedList()) {
        selection.selectNode(node.closest("ul"));
      }
    }
    return this.execCommand("insertorderedlist", false, null);
  },
  /*
    WysiHat.Commands#toggleUnorderedList() -> undefined
  
    Formats current selection as an unordered list. If the selection is empty
    a new list is inserted.
  
    If the selection is already a unordered list, the entire list
    will be toggled. However, toggling the last item of the list
    will only affect that item, not the entire list.
  */

  unorderedList: function() {
    var node, selection;
    selection = void 0;
    node = void 0;
    selection = window.getSelection();
    node = selection.getNode();
    if (this.states.unorderedList() && !node.is("ul li:last-child, ul li:last-child *")) {
      selection.selectNode(node.closest("ul"));
    } else {
      if (this.states.orderedList()) {
        selection.selectNode(node.closest("ol"));
      }
    }
    return this.execCommand("insertunorderedlist", false, null);
  },
  /*
    WysiHat.Commands#insertImage(url) -> undefined
  
    - url (String): value for src
    Insert an image at the insertion point with the given url.
  */

  insertImage: function(url) {
    return this.execCommand("insertImage", false, url);
  },
  /*
    WysiHat.Commands#insertHTML(html) -> undefined
  
    - html (String): HTML or plain text
    Insert HTML at the insertion point.
  */

  insertHTML: function(html) {
    var range;
    if ($.browser.msie) {
      range = window.document.selection.createRange();
      range.pasteHTML(html);
      range.collapse(false);
      return range.select();
    } else {
      return this.execCommand("insertHTML", false, html);
    }
  },
  getSelectedStyles: function() {
    var editor, styles;
    styles = {};
    editor = this;
    editor.styleSelectors.each(function(style) {
      var node;
      node = editor.selection.getNode();
      return styles[style.first()] = $(node).css(style.last());
    });
    return styles;
  }
};

WysiHat.States = {
  queryCommandState: function(state) {
    var handler;
    handler = this.states["" + state];
    if (handler) {
      return handler();
    } else {
      try {
        return window.document.queryCommandState(state);
      } catch (e) {
        return null;
      }
    }
  },
  indented: function() {
    var node;
    node = window.getSelection().getNode();
    return node.is("blockquote, blockquote *");
  },
  aligned: function() {
    var node;
    node = window.getSelection().getNode();
    return $(node).css("textAlign");
  },
  linked: function() {
    var node;
    node = window.getSelection().getNode();
    if (node) {
      return node.get(0).tagName.toUpperCase() === "A";
    } else {
      return false;
    }
  },
  /*
    WysiHat.Commands#orderedListSelected() -> boolean
  
    Check if current selection is within an ordered list.
  */

  orderedList: function() {
    var element;
    element = window.getSelection().getNode();
    if (element) {
      return element.is("*[contenteditable=\"\"] ol, *[contenteditable=true] ol, *[contenteditable=\"\"] ol *, *[contenteditable=true] ol *");
    }
    return false;
  },
  /*
    WysiHat.Commands#unorderedListSelected() -> boolean
  
    Check if current selection is within an unordered list.
  */

  unorderedList: function() {
    var element;
    element = window.getSelection().getNode();
    if (element) {
      return element.is("*[contenteditable=\"\"] ul, *[contenteditable=true] ul, *[contenteditable=\"\"] ul *, *[contenteditable=true] ul *");
    }
    return false;
  }
};


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


$(document).ready(function() {
  var fieldChangeHandler;
  fieldChangeHandler = function(event, element) {
    var $element, value;
    $element = $(element);
    element = $element.get(0);
    value = void 0;
    if ($element.attr("contentEditable") === "true") {
      value = $element.html();
    }
    value = $element.val();
    if (value && element.previousValue !== value) {
      $element.trigger("field:change");
      return element.previousValue = value;
    }
  };
  return $("input,textarea,*[contenteditable=\"\"],*[contenteditable=true]").keyup(fieldChangeHandler);
});


(function() {
  var observeFrameContentLoaded, onFrameLoaded, onReadyStateComplete;
  onReadyStateComplete = function(document, callback) {
    var checkReadyState;
    checkReadyState = function() {
      if (document.readyState === "complete") {
        $(document).unbind("readystatechange", checkReadyState);
        callback();
        return true;
      } else {
        return false;
      }
    };
    $(document).bind("readystatechange", checkReadyState);
    return checkReadyState();
  };
  observeFrameContentLoaded = function(element) {
    var bare, contentLoadedHandler, fireFrameLoaded, loaded;
    fireFrameLoaded = function() {
      var loaded;
      if (loaded) {
        return;
      }
      loaded = true;
      if (contentLoadedHandler) {
        contentLoadedHandler.stop();
      }
      return element.trigger("frame:loaded");
    };
    element = $(element);
    bare = element.get(0);
    loaded = void 0;
    contentLoadedHandler = void 0;
    loaded = false;
    if (window.addEventListener) {
      contentLoadedHandler = $(document).bind("DOMFrameContentLoaded", function(event) {
        if (element === $(this)) {
          return fireFrameLoaded();
        }
      });
    }
    element.load(function() {
      var frameDocument;
      frameDocument = void 0;
      if (typeof element.contentDocument !== "undefined") {
        frameDocument = element.contentDocument;
      } else {
        if (typeof element.contentWindow !== "undefined" && typeof element.contentWindow.document !== "undefined") {
          frameDocument = element.contentWindow.document;
        }
      }
      return onReadyStateComplete(frameDocument, fireFrameLoaded);
    });
    return element;
  };
  onFrameLoaded = function(element, callback) {
    element.bind("frame:loaded", callback);
    return element.observeFrameContentLoaded();
  };
  jQuery.fn.observeFrameContentLoaded = observeFrameContentLoaded;
  return jQuery.fn.onFrameLoaded = onFrameLoaded;
})();


$(document).ready(function() {
  var doc, previousRange, selectionChangeHandler;
  doc = $(document);
  if ("selection" in document && "onselectionchange" in document) {
    selectionChangeHandler = function() {
      var element, range;
      range = document.selection.createRange();
      element = range.parentElement();
      return $(element).trigger("selection:change");
    };
    return doc.bind("selectionchange", selectionChangeHandler);
  } else {
    previousRange = void 0;
    selectionChangeHandler = function() {
      var element, elementTagName, range, selection;
      element = document.activeElement;
      elementTagName = element.tagName.toLowerCase();
      if (elementTagName === "textarea" || elementTagName === "input") {
        previousRange = null;
        return $(element).trigger("selection:change");
      } else {
        selection = window.getSelection();
        if (selection.rangeCount < 1) {
          return;
        }
        range = selection.getRangeAt(0);
        if (range && range.equalRange(previousRange)) {
          return;
        }
        previousRange = range;
        element = range.commonAncestorContainer;
        while (element.nodeType === Node.TEXT_NODE) {
          element = element.parentNode;
        }
        return $(element).trigger("selection:change");
      }
    };
    doc.mouseup(selectionChangeHandler);
    return doc.keyup(selectionChangeHandler);
  }
});


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

/*
section: wysihat
class WysiHat.Toolbar
*/

WysiHat.Toolbar = (function() {
  /*
    new WysiHat.Toolbar(ed)
    - ed (WysiHat.Editor): the editor object that you want to attach to.
  
    This was renamed from 'editor' in the original wysihat code, since I
    had to add a class level 'editor' object, causing a conflict with the
    names.
  
    Creates a toolbar element above the editor. The WysiHat.Toolbar object
    has many helper methods to easily add buttons to the toolbar.
  
    This toolbar class is not required for the Editor object to function.
    It is merely a set of helper methods to get you started and to build
    on top of. If you are going to use this class in your application,
    it is highly recommended that you subclass it and override methods
    to add custom functionality.
  */

  function Toolbar(ed) {
    this.editor = ed;
    this.element = this.createToolbarElement();
    this.addButtonSet();
  }

  /*
    WysiHat.Toolbar#createToolbarElement() -> Element
  
    Creates a toolbar container element and inserts it right above the
    original textarea element. The element is a div with the class
    'editor_toolbar'.
  
    You can override this method to customize the element attributes and
    insert position. Be sure to return the element after it has been
    inserted.
  */


  Toolbar.prototype.createToolbarElement = function() {
    var toolbar;
    toolbar = $("<div class=\"editor_toolbar\"></div>");
    this.editor.before(toolbar);
    return toolbar;
  };

  /*
    WysiHat.Toolbar#addButtonSet(set) -> undefined
    - set (Array): The set array contains nested arrays that hold the
    button options, and handler.
  
    Adds a button set to the toolbar.
  */


  Toolbar.prototype.addButtonSet = function() {
    var set,
      _this = this;
    set = [
      {
        name: "bold",
        label: "<strong>Bold</strong>",
        hotkey: 'meta+b ctrl+b'
      }, {
        name: "italic",
        label: "<em>Italic</em>",
        hotkey: 'meta+i ctrl+i'
      }, {
        name: "underline",
        label: "<u>Underline</u>",
        hotkey: 'meta+u ctrl+u'
      }, {
        name: "unorderedList",
        label: "<i class='icon-list-ul'></i> Bullets"
      }, {
        name: "orderedList",
        label: "<i class='icon-list-ol'></i> Numbers"
      }
    ];
    return $(set).each(function(index, button) {
      return _this.addButton(button);
    });
  };

  /*
    WysiHat.Toolbar#addButton(options[, handler]) -> undefined
    - options (Hash): Required options hash
    - handler (Function): Function to bind to the button
  
    The options hash accepts two required keys, name and label. The label
    value is used as the link's inner text. The name value is set to the
    link's class and is used to check the button state. However the name
    may be omitted if the name and label are the same. In that case, the
    label will be down cased to make the name value. So a "Bold" label
    will default to "bold" name.
  
    The second optional handler argument will be used if no handler
    function is supplied in the options hash.
  
    toolbar.addButton({
    name: 'bold', label: "Bold" }, function(editor) {
    editor.boldSelection();
    });
  
    Would create a link,
    "<a href='#' class='button bold'><span>Bold</span></a>"
  */


  Toolbar.prototype.addButton = function(options, handler) {
    var button;
    button = this.createButtonElement(this.element, options);
    handler = this.buttonHandler(options["name"], options);
    this.observeButtonClick(button, handler);
    handler = this.buttonStateHandler(options["name"], options);
    return this.observeStateChanges(button, options["name"], handler);
  };

  /*
    WysiHat.Toolbar#createButtonElement(toolbar, options) -> Element
    - toolbar (Element): Toolbar element created by createToolbarElement
    - options (Hash): Options hash that pass from addButton
  
    Creates individual button elements and inserts them into the toolbar
    container. The default elements are 'a' tags with a 'button' class.
  
    You can override this method to customize the element attributes and
    insert positions. Be sure to return the element after it has been
    inserted.
  */


  Toolbar.prototype.createButtonElement = function(toolbar, options) {
    var button;
    button = $("<a class=\"btn btn-mini\" href=\"#\">" + options["label"] + "</a>");
    toolbar.append(button);
    if (options["hotkey"]) {
      this.editor.bind('keydown', options["hotkey"], function(e) {
        button.click();
        return e.preventDefault();
      });
    }
    return button;
  };

  /*
    WysiHat.Toolbar#buttonHandler(name, options) -> Function
    - name (String): Name of button command: 'bold', 'italic'
    - options (Hash): Options hash that pass from addButton
  
    Returns the button handler function to bind to the buttons onclick
    event. It checks the options for a 'handler' attribute otherwise it
    defaults to a function that calls execCommand with the button name.
  */


  Toolbar.prototype.buttonHandler = function(name, options) {
    return function(editor) {
      return editor.commands[name].call(editor);
    };
  };

  /*
    WysiHat.Toolbar#observeButtonClick(element, handler) -> undefined
    - element (Element): Button element
    - handler (Function): Handler function to bind to element
  
    Bind handler to elements onclick event.
  */


  Toolbar.prototype.observeButtonClick = function(element, handler) {
    var _this = this;
    return $(element).click(function() {
      handler(_this.editor);
      $(document.activeElement).trigger("selection:change");
      return false;
    });
  };

  /*
    WysiHat.Toolbar#buttonStateHandler(name, options) -> Function
    - name (String): Name of button command: 'bold', 'italic'
    - options (Hash): Options hash that pass from addButton
  
    Returns the button handler function that checks whether the button
    state is on (true) or off (false). It checks the options for a
    'query' attribute otherwise it defaults to a function that calls
    queryCommandState with the button name.
  */


  Toolbar.prototype.buttonStateHandler = function(name, options) {
    return function(editor) {
      return editor.states.queryCommandState.call(editor, name);
    };
  };

  /*
    WysiHat.Toolbar#observeStateChanges(element, name, handler) -> undefined
    - element (Element): Button element
    - name (String): Button name
    - handler (Function): State query function
  
    Determines buttons state by calling the query handler function then
    calls updateButtonState.
  */


  Toolbar.prototype.observeStateChanges = function(element, name, handler) {
    var previousState,
      _this = this;
    previousState = void 0;
    return this.editor.bind("selection:change", function() {
      var state;
      state = handler(_this.editor);
      if (state !== previousState) {
        previousState = state;
        return _this.updateButtonState(element, name, state);
      }
    });
  };

  /*
    WysiHat.Toolbar#updateButtonState(element, name, state) -> undefined
    - element (Element): Button element
    - name (String): Button name
    - state (Boolean): Whether button state is on/off
  
    If the state is on, it adds a 'selected' class to the button element.
    Otherwise it removes the 'selected' class.
  
    You can override this method to change the class name or styles
    applied to buttons when their state changes.
  */


  Toolbar.prototype.updateButtonState = function(elem, name, state) {
    if (state) {
      return $(elem).addClass("active");
    } else {
      return $(elem).removeClass("active");
    }
  };

  return Toolbar;

})();
