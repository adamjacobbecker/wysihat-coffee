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
    jQuery.extend($editArea, WysiHat.Commands);
    $textarea.hide();
    $textarea.closest("form").submit(function() {
      return $textarea.val(WysiHat.Formatting.getApplicationMarkupFrom($editArea));
    });
    return $editArea;
  }
};
