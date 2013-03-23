
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
