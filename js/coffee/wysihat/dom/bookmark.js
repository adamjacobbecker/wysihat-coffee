
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
