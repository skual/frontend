define(['codemirror/codemirror', 'codemirror/mysql', 'Skual', 'session'], function () {
	/**
	 * @name Query
	 * @package Skual
	 */
	Skual.Query = {};
	(function () {
		var query = null, textarea = null, editor = null;
		
		function send() {
			console.log ('send !');
			console.log(editor.getValue());
			return false;
		}
		
		function externalWindow() {
			return false;
		}

		query = jQuery('#querybox');
		textarea = query.find ('>textarea');
		
		editor = CodeMirror.fromTextArea(textarea[0], {'mode': 'text/x-mysql', 'lineNumbers': true, 'mode': 'mysql', 'indentUnit': 4, 'extraKeys': {'Ctrl-Enter': send}});

		jQuery('body>header .nav .query').on ('click', function () {
			var queryLink = $(this).parent();
			if (query.is (':visible')) {
				query.slideUp(250, function () {
					queryLink.removeClass ('active');
				});
			}
			else {
				queryLink.addClass ('active');
				query.slideDown(250);
			}
		});
		
		query.find ('.actions>.btn-primary').on ('click', send);
		query.find ('.actions>.external').on ('click', externalWindow);
	}).apply(Skual.Query);
});