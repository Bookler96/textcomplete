import Textcomplete from "./textcomplete"
import Textarea from "./textarea"
import TinyMCE from './tinymce';

let editors
if (global.Textcomplete && global.Textcomplete.editors) {
  editors = global.Textcomplete.editors
} else {
  editors = {}
}
editors.Textarea = Textarea
editors.TinyMCE = TinyMCE

global.Textcomplete = Textcomplete
global.Textcomplete.editors = editors
