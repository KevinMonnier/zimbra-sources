/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class generates the JSON for autocomplete-related SOAP requests.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.model.address.ZtAutoCompleteWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.autocompletewriter',

	writeRecords: function(request, data) {

		var	action = request.getAction(),
			name = request.getParams().name,
			json, methodJson;

		if (action === 'read') {

			// doing a search - replace the configured 'read' operation URL
			request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'AutoCompleteRequest');

			json = this.getSoapEnvelope(request, data, 'AutoComplete');
			methodJson = json.Body.AutoCompleteRequest;

			Ext.apply(methodJson, {
				offset: 0,
				limit: 25,
				name: name
			});

		}

		request.setJsonData(json);

		return request;
	}
});
