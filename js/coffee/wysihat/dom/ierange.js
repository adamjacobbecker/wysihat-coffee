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
