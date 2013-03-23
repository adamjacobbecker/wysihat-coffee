
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
