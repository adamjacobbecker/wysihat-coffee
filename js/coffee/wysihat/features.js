
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
