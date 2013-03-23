
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
