/**
 * This class is a simple SOAP proxy for talking to the Zimbra server.
 */
Ext.define('ZCS.model.ZtSoapProxy', {

	extend: 'Ext.data.proxy.Ajax',

	alias: 'proxy.soapproxy',

	/**
	 * Override so we can handle the inlined initial search results, which are then cleared so
	 * that we only do this once.
	 */
	doRequest: function(operation, callback, scope) {

		var me = this,
			inlineResults = ZCS.session.getInitialSearchResults();

		if (inlineResults) {

			// cobble together the appropriate request so that we can pretend it was used to get
			// these results
			var request = me.buildRequest(operation),
				response;

			operation.config.query = ZCS.session.getSetting(ZCS.constant.SETTING_INITIAL_SEARCH);

			request.setConfig({
				headers  : me.getHeaders(),
				timeout  : me.getTimeout(),
				method   : me.getMethod(request),
				callback : me.createRequestCallback(request, operation, callback, scope),
				scope    : me,
				proxy    : me
			});

			var data = {
				Body: {
					SearchResponse: inlineResults
				}
			};

			// cobble together a response that contains the results we already have
			response = {
				request: request,
				requestId : request.id,
				status : 200,
				statusText : 'OK',
				getResponseHeader : function(header) {
					return '';
				},
				getAllResponseHeaders : function() {
					return {};
				},
				responseText : data
			};

			// Go!
			this.processResponse(true, operation, request, response, callback, scope);

			// Erase the canned results since we only do this once.
			ZCS.session.setInitialSearchResults(null);
		}
		else {
			return me.callParent(arguments);
		}
	},

	/**
	 * When we get the response to a search request, set the text in the search field to the
	 * search query if the user wants to see it.
	 */
	processResponse: function(success, operation, request, response, callback, scope) {
		this.callParent(arguments);
		var query = operation.config.query;
		if (query && ZCS.session.getSetting(ZCS.constant.SETTING_SHOW_SEARCH)) {
			ZCS.session.getActiveSearchField().setValue(query);
		}
	}
});
