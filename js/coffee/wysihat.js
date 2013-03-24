var WysiHat;

WysiHat = {};

$.fn.wysihat = function() {
  var result;
  result = void 0;
  return this.each(function() {
    var $editor;
    $editor = WysiHat.Editor.attach($(this));
    $editor.toolbar = new WysiHat.Toolbar($editor);
    return $(this).data('wysihat', result);
  });
};
