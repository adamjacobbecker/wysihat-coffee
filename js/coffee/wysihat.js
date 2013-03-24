var WysiHat;

WysiHat = {};

(function($) {
  return $.fn.wysihat = function() {
    var result;
    result = void 0;
    this.each(function() {
      var $editor, toolbar;
      $editor = WysiHat.Editor.attach($(this));
      toolbar = new WysiHat.Toolbar($editor);
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
