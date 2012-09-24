define(['Skual'], function () {
	Skual.Events = {};
	(function () {
		var events = {};
		
		/**
		 * @name notify
		 * Will notify the callbacks of this specified event
		 * The notify event can be stopped if a callback returns false
		 * 
		 * @param String event
		 */
		this.trigger = function (event) {
			if (String.isEmpty(event))
				throw 'Event name is required';
			
			var namespace = null,
				dotPosition = event.indexOf('.');
			
			if (dotPosition !== -1) {
				namespace = event.substr(dotPosition + 1);
				event = event.substr(0, dotPosition);
			}
			
			if (events[event] === undefined)
				return true;
			
			for (var i = 0; i < events[event]; i++) {
				if (namespace !== null && events[event][i]['namespace'] !== namespace)
					continue;
				
				var result = events[event][i]['callback'].apply({}, events[event][i]['data']);
				if (result === false)
					return false;
			}
			
			return true;
		};
		
		/**
		 * @name on
		 * Subscribe to an event
		 * 
		 * @param String event : The event name. It can be set with a dot "." for specifying a namespace
		 * @param Array data : An optionnal array to be passed to the callback
		 * @param Function callback : A function to call when the event is triggered
		 */
		this.on = function (event) {
			if (String.isEmpty(event))
				throw 'Event name is required.';
			
			var namespace = null,
				dotPosition = event.indexOf('.');
			
			if (dotPosition !== -1) {
				namespace = event.substr(dotPosition + 1);
				event = event.substr(0, dotPosition);
			}
			
			var data = null, callback = arguments[1];
			if (arguments.length === 3) {
				data = arguments[1];
				callback = arguments[2];
			}
			
			events[event].push ({
				'namespace': namespace,
				'callback': callback,
				'data': data
			});
		};
		
		/**
		 * @name off
		 * Unsubscribe from an event
		 * 
		 * @param String event : The event name. It can be set with a dot "." for specifying a namespace
		 */
		this.off = function (event) {
			if (String.isEmpty(event))
				throw 'Event name is required.';
			
			var namespace = '',
				dotPosition = event.indexOf('.');
			
			if (dotPosition !== -1) {
				namespace = event.substr(dotPosition + 1);
				event = event.substr(0, dotPosition);
			}
			
			if (events[event] === undefined)
				throw 'Event ' + event + ' does not exists.';
			
			if (namespace === null) {
				events[event] = [];
			}
			else {
				for (var i = 0; i < events[event]; i++) {
					if (events[event][i]['namespace'] === namespace)
						delete events[event][i];
				}
			}
		};
	}).apply(Skual.Events);
});