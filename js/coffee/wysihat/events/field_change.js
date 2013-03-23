
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
