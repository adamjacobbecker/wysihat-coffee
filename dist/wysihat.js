var camelize, capitalize, wysiHatify;

camelize = function(s) {
  var camel;
  camel = s.trim().replace(/(\-|_|\s)+(.)?/g, function(mathc, sep, c) {
    if (c) {
      return c.toUpperCase();
    } else {
      return "";
    }
  });
  return camel;
};

this.camelize = camelize;

capitalize = function(s) {
  return s.substr(0, 1).toUpperCase() + s.substring(1).toLowerCase();
};

this.capitalize = capitalize;

wysiHatify = function(tag_id, buttons) {
  var button, editor, toolbar, _i, _len;
  editor = WysiHat.Editor.attach($(tag_id));
  toolbar = new WysiHat.Toolbar(editor);
  toolbar.initialize(editor);
  for (_i = 0, _len = buttons.length; _i < _len; _i++) {
    button = buttons[_i];
    toolbar.addButton({
      label: this.capitalize(this.camelize(button))
    });
  }
  return editor.toolbar = toolbar;
};

this.wysiHatify = wysiHatify;
