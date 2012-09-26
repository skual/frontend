define(['Skual', 'events'], function () {
	/**
	 * @name Session
	 * @package Skual
	 * 
	 * Manage the whole session for a user :
	 * 		* Connect
	 * 		* Disconnect
	 * 		* Auto reconnect
	 * 
	 * Automatically starts when loaded
	 */
	Skual.Session = {};
	(function () {
		var connected = false,
			session = null,
			token = null,
			login = jQuery('#modal-login'),
			timeout = null;
		
		/**
		 * @name submit
		 * Send a request to the server on form submit from the login modal
		 * Connect to the server and keep the token if successful
		 */
		function submit(oEvent) {
			var form = jQuery(this);
			session = form.serializeObject();

			jQuery.send({
				'url': '/connect',
				'type': 'POST',
				'data': jQuery.param(session),
				'success': function (oData) {
					// Set variables
					token = oData.token;
					connected = true;
					
					// clear fields
					login.find ('form').clearForm();
					
					// hide modal
					login.modal('hide');
					
					// throw events
					Skual.Events.trigger('connected');
					
					// Will try to automatically reconnect 10 seconds before the session expires
					var interval = (oData.expire * 1000) - Math.round(new Date().getTime()) - 10000;
					timeout = setTimeout(autoConnect, interval);
				},
				'error': function (request, status, error) {
					var oData = jQuery.parseJSON(request.responseText);
					if ('errors' in oData) {
						form.clearErrors(true).setErrors(oData.errors);
					}
					else if ('message' in oData) {
						showMessage(oData.message, 'danger');
					}

					return false;
				}
			});
			return false;
		};
		
		function autoConnect() {
			if (typeof(session) !== 'object')
				return false;
			
			jQuery.send({
				'url': '/connect',
				'type': 'POST',
				'data': jQuery.param(session),
				'success': function (oData) {
					// throw events
					Skual.Events.trigger('reconnected');
					
					// Will try to automatically reconnect 10 seconds before the session expires
					var interval = (oData.expire * 1000) - Math.round(new Date().getTime()) - 10000;
					timeout = setTimeout(autoConnect, interval);
				},
				'error': function (request, status, error) {
					var oData = jQuery.parseJSON(request.responseText);
					
					token = null;
					login.find ('>form').setForm(session);
					session = null;
					connected = false;
					
					Skual.Events.trigger('disconnected');
					showMessage(oData.message, 'info');
					Skual.Session.connect();
					return false;
				}
			});
		};
		
		/**
		 * Toggle the state of the "Advanced" fieldset
		 * State can be forced to :
		 * 		* show : The "Advanced" fieldset will be shown
		 * 		* hide : The "Advanced" fieldset will be hidden
		 * 		* toggle : The "Advanced" fieldset will be set to the opposite of its current state
		 */
		function toggleAdvanced(oEvent, state, speed) {
			if (String.isEmpty(state)) state = 'toggle';
			if (String.isEmpty(speed)) speed = 250;

			state = state.toLowerCase();
			
			var fieldset = login.find ('.modal-body>fieldset.advanced'),
				visible = fieldset.is(':visible');
			
			fieldset.stop(true, true);

			if ((visible && state === 'toggle') || state === 'hide') {
				if (speed === 0) fieldset.hide();
				else fieldset.slideUp(speed);
				jQuery(this).find ('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
			}
			else if ((!visible && state === 'toggle') || state === 'show') {
				if (speed === 0) fieldset.show();
				else fieldset.slideDown(speed);
				jQuery(this).find ('i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
			}
		};
		
		function showMessage(message, type) {
			if (type === undefined)
				type = 'danger';
			
			login.find ('.modal-body>.alert')
					.slideUp(250)
					.removeClass('alert-info alert-warning alert-danger')
					.addClass('alert-' + type)
					.text(message)
					.slideDown(500);
		};
		
		/**
		 * Show the modal to connect to a database
		 * Can be shown with an information message like "Your session has expired"
		 */
		this.connect = function () {
			// Affects values
			for (key in Skual.config.database) {
				login.find ('#login-server-' + key).val(Skual.config.database[key]);
			}
			
			login.modal({'keyboard': false, 'backdrop': 'static', 'show': true});
		};
		
		this.disconnect = function () {
			jQuery.confirm.call(this, 'Are you sure you want to close the session?', 'Disconnect', function (state) {
				if (!state) return false;
				token = null;
				session = null;
				connected = false;
				
				clearTimeout(timeout);
				timeout = null;
				
				Skual.Events.trigger('disconnected');
				this.connect();
			});
		};
		
		this.isConnected = function () {
			return connected;
		};
		
		this.getToken = function () {
			return token;
		};
		
		/** INIT **/
		login.find ('.modal-body>.alert').hide();
		login.find ('>form').on ('submit', submit);
		login.find ('.modal-body>.control-group>a').on ('click', toggleAdvanced);
		
		// Show the connect page
		toggleAdvanced.apply(login.find ('.modal-body>.control-group>a'), [null, 'hide', 0]);
		//if (!connected) this.connect();

	}).apply(Skual.Session);
});