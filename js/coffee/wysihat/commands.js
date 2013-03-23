/*
section: wysihat
mixin WysiHat.Commands

Methods will be mixed into the editor element. Most of these
methods will be used to bind to button clicks or key presses.

var editor = WysiHat.Editor.attach(textarea);
$('#bold_button').click(function(event) {
editor.boldSelection();
return false;
});

In this example, it is important to stop the click event so you don't
lose your current selection.
*/

WysiHat.Commands = (function(window) {
  /*
    WysiHat.Commands#boldSelection() -> undefined
  
    Bolds the current selection.
  */

  var alignSelected, alignSelection, backgroundColorSelection, boldSelected, boldSelection, colorSelection, execCommand, fontSelection, fontSizeSelection, formatblockSelection, getSelectedStyles, indentSelected, indentSelection, insertHTML, insertImage, insertOrderedList, insertUnorderedList, italicSelected, italicSelection, linkSelected, linkSelection, orderedListSelected, outdentSelection, queryCommandState, strikethroughSelection, toggleIndentation, toggleOrderedList, toggleUnorderedList, underlineSelected, underlineSelection, unlinkSelection, unorderedListSelected;
  boldSelection = function() {
    return this.execCommand("bold", false, null);
  };
  /*
    WysiHat.Commands#boldSelected() -> boolean
  
    Check if current selection is bold or strong.
  */

  boldSelected = function() {
    return this.queryCommandState("bold");
  };
  /*
    WysiHat.Commands#underlineSelection() -> undefined
  
    Underlines the current selection.
  */

  underlineSelection = function() {
    return this.execCommand("underline", false, null);
  };
  /*
    WysiHat.Commands#underlineSelected() -> boolean
  
    Check if current selection is underlined.
  */

  underlineSelected = function() {
    return this.queryCommandState("underline");
  };
  /*
    WysiHat.Commands#italicSelection() -> undefined
  
    Italicizes the current selection.
  */

  italicSelection = function() {
    return this.execCommand("italic", false, null);
  };
  /*
    WysiHat.Commands#italicSelected() -> boolean
  
    Check if current selection is italic or emphasized.
  */

  italicSelected = function() {
    return this.queryCommandState("italic");
  };
  /*
    WysiHat.Commands#italicSelection() -> undefined
  
    Strikethroughs the current selection.
  */

  strikethroughSelection = function() {
    return this.execCommand("strikethrough", false, null);
  };
  /*
    WysiHat.Commands#indentSelection() -> undefined
  
    Indents the current selection.
  */

  indentSelection = function() {
    var blockquote, node, range, selection;
    if ($.browser.mozilla) {
      selection = void 0;
      range = void 0;
      node = void 0;
      blockquote = void 0;
      selection = window.getSelection();
      range = selection.getRangeAt(0);
      node = selection.getNode();
      if (range.collapsed) {
        range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      blockquote = $("<blockquote></blockquote>");
      range = selection.getRangeAt(0);
      return range.surroundContents(blockquote);
    } else {
      return this.execCommand("indent", false, null);
    }
  };
  /*
    WysiHat.Commands#outdentSelection() -> undefined
  
    Outdents the current selection.
  */

  outdentSelection = function() {
    return this.execCommand("outdent", false, null);
  };
  /*
    WysiHat.Commands#toggleIndentation() -> undefined
  
    Toggles indentation the current selection.
  */

  toggleIndentation = function() {
    if (this.indentSelected()) {
      return this.outdentSelection();
    } else {
      return this.indentSelection();
    }
  };
  /*
    WysiHat.Commands#indentSelected() -> boolean
  
    Check if current selection is indented.
  */

  indentSelected = function() {
    var node;
    node = window.getSelection().getNode();
    return node.is("blockquote, blockquote *");
  };
  /*
    WysiHat.Commands#fontSelection(font) -> undefined
  
    Sets the font for the current selection
  */

  fontSelection = function(font) {
    return this.execCommand("fontname", false, font);
  };
  /*
    WysiHat.Commands#fontSizeSelection(fontSize) -> undefined
    - font size (int) : font size for selection
  
    Sets the font size for the current selection
  */

  fontSizeSelection = function(fontSize) {
    return this.execCommand("fontsize", false, fontSize);
  };
  /*
    WysiHat.Commands#colorSelection(color) -> undefined
    - color (String): a color name or hexadecimal value
  
    Sets the foreground color of the current selection.
  */

  colorSelection = function(color) {
    return this.execCommand("forecolor", false, color);
  };
  /*
    WysiHat.Commands#backgroundColorSelection(color) -> undefined
    - color (string) - a color or hexadecimal value
  
    Sets the background color.  Firefox will fill in the background
    color of the entire iframe unless hilitecolor is used.
  */

  backgroundColorSelection = function(color) {
    if ($.browser.mozilla) {
      return this.execCommand("hilitecolor", false, color);
    } else {
      return this.execCommand("backcolor", false, color);
    }
  };
  /*
    WysiHat.Commands#alignSelection(color) -> undefined
    - alignment (string) - how the text should be aligned (left, center, right)
  */

  alignSelection = function(alignment) {
    return this.execCommand("justify" + alignment);
  };
  /*
    WysiHat.Commands#backgroundColorSelected() -> alignment
  
    Returns the alignment of the selected text area
  */

  alignSelected = function() {
    var node;
    node = window.getSelection().getNode();
    return $(node).css("textAlign");
  };
  /*
    WysiHat.Commands#linkSelection(url) -> undefined
    - url (String): value for href
  
    Wraps the current selection in a link.
  */

  linkSelection = function(url) {
    return this.execCommand("createLink", false, url);
  };
  /*
    WysiHat.Commands#unlinkSelection() -> undefined
  
    Selects the entire link at the cursor and removes it
  */

  unlinkSelection = function() {
    var node;
    node = window.getSelection().getNode();
    if (this.linkSelected()) {
      window.getSelection().selectNode(node);
    }
    return this.execCommand("unlink", false, null);
  };
  /*
    WysiHat.Commands#linkSelected() -> boolean
  
    Check if current selection is link.
  */

  linkSelected = function() {
    var node;
    node = window.getSelection().getNode();
    if (node) {
      return node.get(0).tagName.toUpperCase() === "A";
    } else {
      return false;
    }
  };
  /*
    WysiHat.Commands#formatblockSelection(element) -> undefined
    - element (String): the type of element you want to wrap your selection
    with (like 'h1' or 'p').
  
    Wraps the current selection in a header or paragraph.
  */

  formatblockSelection = function(element) {
    return this.execCommand("formatblock", false, element);
  };
  /*
    WysiHat.Commands#toggleOrderedList() -> undefined
  
    Formats current selection as an ordered list. If the selection is empty
    a new list is inserted.
  
    If the selection is already a ordered list, the entire list
    will be toggled. However, toggling the last item of the list
    will only affect that item, not the entire list.
  */

  toggleOrderedList = function() {
    var node, selection;
    selection = void 0;
    node = void 0;
    selection = window.getSelection();
    node = selection.getNode();
    if (this.orderedListSelected() && !node.is("ol li:last-child, ol li:last-child *")) {
      selection.selectNode(node.closest("ol"));
    } else {
      if (this.unorderedListSelected()) {
        selection.selectNode(node.closest("ul"));
      }
    }
    return this.execCommand("insertorderedlist", false, null);
  };
  /*
    WysiHat.Commands#insertOrderedList() -> undefined
  
    Alias for WysiHat.Commands#toggleOrderedList
  */

  insertOrderedList = function() {
    return this.toggleOrderedList();
  };
  /*
    WysiHat.Commands#orderedListSelected() -> boolean
  
    Check if current selection is within an ordered list.
  */

  orderedListSelected = function() {
    var element;
    element = window.getSelection().getNode();
    if (element) {
      return element.is("*[contenteditable=\"\"] ol, *[contenteditable=true] ol, *[contenteditable=\"\"] ol *, *[contenteditable=true] ol *");
    }
    return false;
  };
  /*
    WysiHat.Commands#toggleUnorderedList() -> undefined
  
    Formats current selection as an unordered list. If the selection is empty
    a new list is inserted.
  
    If the selection is already a unordered list, the entire list
    will be toggled. However, toggling the last item of the list
    will only affect that item, not the entire list.
  */

  toggleUnorderedList = function() {
    var node, selection;
    selection = void 0;
    node = void 0;
    selection = window.getSelection();
    node = selection.getNode();
    if (this.unorderedListSelected() && !node.is("ul li:last-child, ul li:last-child *")) {
      selection.selectNode(node.closest("ul"));
    } else {
      if (this.orderedListSelected()) {
        selection.selectNode(node.closest("ol"));
      }
    }
    return this.execCommand("insertunorderedlist", false, null);
  };
  /*
    WysiHat.Commands#insertUnorderedList() -> undefined
  
    Alias for WysiHat.Commands#toggleUnorderedList()
  */

  insertUnorderedList = function() {
    return this.toggleUnorderedList();
  };
  /*
    WysiHat.Commands#unorderedListSelected() -> boolean
  
    Check if current selection is within an unordered list.
  */

  unorderedListSelected = function() {
    var element;
    element = window.getSelection().getNode();
    if (element) {
      return element.is("*[contenteditable=\"\"] ul, *[contenteditable=true] ul, *[contenteditable=\"\"] ul *, *[contenteditable=true] ul *");
    }
    return false;
  };
  /*
    WysiHat.Commands#insertImage(url) -> undefined
  
    - url (String): value for src
    Insert an image at the insertion point with the given url.
  */

  insertImage = function(url) {
    return this.execCommand("insertImage", false, url);
  };
  /*
    WysiHat.Commands#insertHTML(html) -> undefined
  
    - html (String): HTML or plain text
    Insert HTML at the insertion point.
  */

  insertHTML = function(html) {
    var range;
    if ($.browser.msie) {
      range = window.document.selection.createRange();
      range.pasteHTML(html);
      range.collapse(false);
      return range.select();
    } else {
      return this.execCommand("insertHTML", false, html);
    }
  };
  /*
    WysiHat.Commands#execCommand(command[, ui = false][, value = null]) -> undefined
    - command (String): Command to execute
    - ui (Boolean): Boolean flag for showing UI. Currenty this not
    implemented by any browser. Just use false.
    - value (String): Value to pass to command
  
    A simple delegation method to the documents execCommand method.
  */

  execCommand = function(command, ui, value) {
    var handler;
    handler = this.commands[command];
    if (handler) {
      handler.bind(this)(value);
    } else {
      try {
        window.document.execCommand(command, ui, value);
      } catch (e) {
        return null;
      }
    }
    return $(document.activeElement).trigger("field:change");
  };
  /*
    WysiHat.Commands#queryCommandState(state) -> Boolean
    - state (String): bold, italic, underline, etc
  
    A delegation method to the document's queryCommandState method.
  
    Custom states handlers can be added to the queryCommands hash,
    which will be checked before calling the native queryCommandState
    command.
  
    editor.queryCommands.set("link", editor.linkSelected);
  */

  queryCommandState = function(state) {
    var handler;
    handler = this.queryCommands[state];
    if (handler) {
      return handler();
    } else {
      try {
        return window.document.queryCommandState(state);
      } catch (e) {
        return null;
      }
    }
  };
  /*
    WysiHat.Commands#getSelectedStyles() -> Hash
  
    Fetches the styles (from the styleSelectors hash) from the current
    selection and returns it as a hash
  */

  getSelectedStyles = function() {
    var editor, styles;
    styles = {};
    editor = this;
    editor.styleSelectors.each(function(style) {
      var node;
      node = editor.selection.getNode();
      return styles[style.first()] = $(node).css(style.last());
    });
    return styles;
  };
  return {
    boldSelection: boldSelection,
    boldSelected: boldSelected,
    underlineSelection: underlineSelection,
    underlineSelected: underlineSelected,
    italicSelection: italicSelection,
    italicSelected: italicSelected,
    strikethroughSelection: strikethroughSelection,
    indentSelection: indentSelection,
    outdentSelection: outdentSelection,
    toggleIndentation: toggleIndentation,
    indentSelected: indentSelected,
    fontSelection: fontSelection,
    fontSizeSelection: fontSizeSelection,
    colorSelection: colorSelection,
    backgroundColorSelection: backgroundColorSelection,
    alignSelection: alignSelection,
    alignSelected: alignSelected,
    linkSelection: linkSelection,
    unlinkSelection: unlinkSelection,
    linkSelected: linkSelected,
    formatblockSelection: formatblockSelection,
    toggleOrderedList: toggleOrderedList,
    insertOrderedList: insertOrderedList,
    orderedListSelected: orderedListSelected,
    toggleUnorderedList: toggleUnorderedList,
    insertUnorderedList: insertUnorderedList,
    unorderedListSelected: unorderedListSelected,
    insertImage: insertImage,
    insertHTML: insertHTML,
    execCommand: execCommand,
    queryCommandState: queryCommandState,
    getSelectedStyles: getSelectedStyles,
    commands: {},
    queryCommands: {
      link: linkSelected,
      numbers: orderedListSelected,
      bullets: unorderedListSelected
    },
    styleSelectors: {
      fontname: "fontFamily",
      fontsize: "fontSize",
      forecolor: "color",
      hilitecolor: "backgroundColor",
      backcolor: "backgroundColor"
    }
  };
})(window);
