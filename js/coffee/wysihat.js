var WysiHat;

WysiHat = {};

(function($) {
  return $.fn.wysihat = function(buttons) {
    var result;
    buttons = (typeof buttons === "undefined" ? WysiHat.Toolbar.ButtonSets.Standard : buttons);
    result = void 0;
    this.each(function() {
      var $editor, toolbar;
      $editor = WysiHat.Editor.attach($(this));
      toolbar = new WysiHat.Toolbar($editor);
      toolbar.addButtonSet(buttons);
      $editor.toolbar = toolbar;
      if (result) {
        return result.add($editor);
      } else {
        return result = $editor;
      }
    });
    return result;
  };
})(jQuery);
