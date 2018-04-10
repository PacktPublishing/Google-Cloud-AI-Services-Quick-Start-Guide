export const GLOBAL = {
	editorConfig: {
		"editable": true,
		"spellcheck": true,
		"height": "auto",
		"minHeight": "300",
		"width": "auto",
		"minWidth": "0",
		"translate": "yes",
		"enableToolbar": true,
		"showToolbar": true,
		"placeholder": "Describe thread",
		"imageEndPoint": "http://myApiEndPoint",
		"toolbar": [
			["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
			["fontSize", "color"],
			["justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "indent", "outdent"],
			["cut", "copy", "delete", "removeFormat", "undo", "redo"],
			["paragraph", "blockquote", "removeBlockquote", "horizontalLine", "orderedList", "unorderedList"],
			["link", "unlink"]
		]
	},
	allowedImageExt: ['jpg', 'jpeg', 'gif', 'bmp', 'png']
}