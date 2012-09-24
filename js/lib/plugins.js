if (String.isEmpty === undefined) {
	String.isEmpty = function (value) {
		return (value === undefined || value === null || value === "");
	}
}

(function($) {
	$.fn.extend({
		'clearErrors': function () {
			var $this = $(this);
			$this.find ('.error').removeClass('error').find('p.help-block').remove();
			return $this;
		},
		'setErrors': function (oErrors) {
			var $this = $(this);

			for (sKey in oErrors) {
				var oItem = $this.find('input[name=' + sKey + '], select[name=' + sKey + '], textarea[name=' + sKey + ']'),
					oParent = oItem.closest('div.control-group');

				if (oParent.hasClass ('error')) continue;

				var oMessage = $('<p />', {'class': 'help-block', 'html': oErrors[sKey][0]}).hide(), oControls = oParent.find ('div.controls');

				oParent.addClass ('error');

				if (oControls.length >= 1) oControls.append (oMessage);
				else oParent.append (oMessage);

				oMessage.css ({'height': oMessage.height()}).slideDown(500);
			}
			
			return $this;
		},
		'clearForm': function () {
			var form = $(this);
			form.find (':input[type!=radio][type!=checkbox][type!=submit][type!=button]').val('');
			form.find (':input[type=radio],:input[type=checkbox]').prop('checked', false);
			form.find('select[multiple]').prop('selected', false);
			form.find(':input[data-default]').each (function () {
				$(this).val($(this).data('default'));
			})
			return form;
		},
		'setForm': function (values) {
			for (key in values) {
				
			}
		},
		'serializeObject': function () {
			var aFields = $(this).serializeArray(),
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
	$.extend({
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
				}
			}

			jqXhr = jQuery.ajax(settings);
			jqXhr.done(successCallback).fail(errorCallback).always(completeCallback);
			return jqXhr;
		}
	});
})(jQuery);