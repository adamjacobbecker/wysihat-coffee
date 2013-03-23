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
