if (String.isEmpty === undefined) {
	String.isEmpty = function (value) {
		return (value === undefined || value === null || value === "");
	};
}

(function(jQuery) {
	jQuery.fn.extend({
		'clearErrors': function () {
			var jQuerythis = jQuery(this);
			jQuerythis.find ('.error').removeClass('error').find('p.help-block').remove();
			return jQuerythis;
		},
		'setErrors': function (oErrors) {
			var jQuerythis = jQuery(this);

			for (key in oErrors) {
				var oItem = jQuerythis.find('input[name=' + key + '], select[name=' + key + '], textarea[name=' + key + ']'),
					oParent = oItem.closest('div.control-group');

				if (oParent.hasClass ('error')) continue;

				var oMessage = jQuery('<p />', {'class': 'help-block', 'html': oErrors[key][0]}).hide(), oControls = oParent.find ('div.controls');

				oParent.addClass ('error');

				if (oControls.length >= 1) oControls.append (oMessage);
				else oParent.append (oMessage);

				oMessage.css ({'height': oMessage.height()}).slideDown(500);
			}
			
			return jQuerythis;
		},
		'clearForm': function () {
			var form = jQuery(this);
			form.find (':input[type!=radio][type!=checkbox][type!=submit][type!=button]').val('');
			form.find (':input[type=radio],:input[type=checkbox]').prop('checked', false);
			form.find('select[multiple]').prop('selected', false);
			form.find(':input[data-default]').each (function () {
				jQuery(this).val(jQuery(this).data('default'));
			});
			
			return form;
		},
		'setForm': function (values) {
			for (key in values) {
				if (values[key] === null) continue;
				
				var element = jQuery('input[name="' + key + '"], textarea[name="' + key +'"], select[name="' + key +'"]', this);
				if (element.length === 0) continue;
				
				if (element.attr ('type') === 'checkbox') {
					if (typeof(values[key]) === 'string') element.attr ('checked', (values[key] === "true" || values[key] === "1"));
					else element.attr ('checked', values[key]);
				}
				else if (element.attr ('type') === 'radio') {
					for (var i = 0; i < element.length; i++) {
						if (typeof (values[key]) === 'boolean')
							jQuery(element[i]).prop('checked', values[key]);
						else
							jQuery(element[i]).prop('checked', (jQuery(element[i]).val() === values[key]));
					}
				}
				else if (element.is('select') && element.prop ('multiple')) {
					if (typeof(values[key]) === 'string' && values[key].split(';').length > 0) {
						element.val(values[key].split(';'));
					}
					else {
						if (values[key].length === 0)
							values[key] = [""];
						
						element.val(values[key]);
					}
				}
				else {
					element.val(String(values[key]));
				}
			}
		},
		'serializeObject': function () {
			var aFields = jQuery(this).serializeArray(),
				oSerialized = {};
			
			for (var i = 0; i < aFields.length; i++) {
				if (String.isEmpty(aFields[i].value))
					continue;
				
				if (typeof(oSerialized[aFields[i].name]) === 'undefined')
					oSerialized[aFields[i].name] = aFields[i].value;
				else if (typeof(oSerialized[aFields[i].name]) === 'object')
					oSerialized[aFields[i].name].push (aFields[i].value);
				else {
					var original = oSerialized[aFields[i].name];
					oSerialized[aFields[i].name] = [];
					oSerialized[aFields[i].name].push (original);
					oSerialized[aFields[i].name].push (aFields[i].value);
				}
			}
			
			return oSerialized;
		}
	});
	jQuery.extend({
		'send': function (settings) {
			// Setting default values
			if (!'type' in settings) settings['type'] = 'POST';
			if (!'timeout' in settings) settings['timeout'] = 10000; // 10 seconds
			
			if (!'data' in settings) settings['data'] = {};
			settings['data']['token'] = Skual.Session.getToken();
			
			if (settings['url'].substr(0, Skual.config.baseUrl.length) !== Skual.config.baseUrl)
				settings['url'] = Skual.config.baseUrl + settings['url'];
			
			var successCallback = settings['success'],
				errorCallback = settings['error'],
				completeCallback = settings['callback'];
			
			delete settings['success'];
			delete settings['error'];
			delete settings['callback'];
			
			if (errorCallback === undefined) {
				errorCallback = function (request, status, error) {
					var data = jQuery.parseJSON(request.responseText);
					alert ('<strong>Request failed :</strong> ' + data.message);
				};
			}

			jqXhr = jQuery.ajax(settings);
			jqXhr.done(successCallback).fail(errorCallback).always(completeCallback);
			return jqXhr;
		},
		'alert': function (message) {
			var title = (arguments.length < 2) ? "Alert" : arguments[1],
				style = (arguments.length < 3) ? null : arguments[2];

			buttonStyle = 'btn-primary';
			if (style === 'error') buttonStyle = 'btn-danger';
			else if (style === 'success') buttonStyle = 'btn-success';
			else if (style === 'warning') buttonStyle = 'btn-warning';
			
			var button = jQuery('<a />', {'title': 'Close this modal', 'text': 'Ok', 'class': 'btn ' + buttonStyle})
				.on('click', function () {jQuery(this).closest('.modal').modal('hide');});

			jQuery('<div />', {'class': 'modal hide fade'})
				.append (
					jQuery('<div />', {'class': 'modal-header'}).append (
						jQuery('<h3 />', {'text': title})
					),
					jQuery('<div />', {'class': 'modal-body'}).append (
						(style === null)
							? jQuery('<p />').html(message)
							: jQuery('<div />', {'class': 'alert alert-block alert-' + style}).append (jQuery('<p />').html(message))
					),
					jQuery('<div />', {'class': 'modal-footer'}).append (button)
				)
				.appendTo('body')
				.on ('hidden', function () {jQuery(this).remove();})
				.modal({'backdrop': 'static', 'show': true});
		},
		'confirm': function (message, title) {
			if (title === undefined)
				title = 'Confirm';
			
			var style = (arguments[2] !== undefined) ? arguments[2] : null,
				actions = (arguments[3] !== undefined) ? arguments[3] : {},
				callback = (arguments[4] !== undefined) ? arguments[4] : null;

			if (style !== null) {
				if (typeof(style) === 'object') {
					actions = style;
					style = null;
				}
				else if (typeof (style) === 'function') {
					callback = style;
					actions = {};
					style = null;
				}
			}
			
			if (typeof(actions) === 'function') {
				callback = actions;
				actions = {};
			}
			
			if (actions['no'] === undefined) {
				actions['no'] = 'cancel';
			}
			
			if (actions['yes'] === undefined) {
				actions['yes'] = 'Confirm';
			}

			var buttonStyle = ' btn-primary';
			if (style === 'error') buttonStyle = ' btn-danger';
			else if (style === 'success') buttonStyle = ' btn-success';
			else if (style === 'warning') buttonStyle = ' btn-warning';

			var noButton = jQuery('<input />', {'type': 'button', 'name': 'no', 'class': 'btn', 'value': actions['no']}),
				yesButton = jQuery('<input />', {'type': 'button', 'name': 'yes', 'class': 'btn' + buttonStyle, 'value': actions['yes']});
			
			var scope = this;
			
			function clicked() {
				if (callback !== undefined && typeof (callback) === 'function') {
					callback.call (scope, (this.name === 'yes'));
				}
				jQuery(this).closest('.modal').modal('hide');
			}
			
			noButton.on ('click', clicked).css ({'float': 'left'});
			yesButton.on ('click', clicked);
			
			jQuery('<div />', {'class': 'modal hide fade'})
				.append (
					jQuery('<div />', {'class': 'modal-header'}).append (
						jQuery('<h3 />', {'text': title})
					),
					jQuery('<div />', {'class': 'modal-body'}).append (
						(style === null)
							? jQuery('<p />').html(message)
							: jQuery('<div />', {'class': 'alert alert-block alert-' + style}).append (jQuery('<p />').html(message))
					),
					jQuery('<div />', {'class': 'modal-footer'}).append (yesButton, noButton)
				)
				.appendTo('body')
				.on ('hidden', function () {jQuery(this).remove();})
				.modal({'backdrop': 'static', 'show': true});
		}
	});
})(jQuery);