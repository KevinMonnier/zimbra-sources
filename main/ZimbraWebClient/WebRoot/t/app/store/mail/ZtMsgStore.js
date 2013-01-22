/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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
 * This class respresents a store of messages.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.store.mail.ZtMsgStore', {

	extend: 'ZCS.store.mail.ZtMailStore',

	config: {
		model: 'ZCS.model.mail.ZtMsg',

		listeners: {

			// add the msgs that were just loaded to their owning conv
			refresh: function(me, records, eOpts) {

				var conv = ZCS.app.getController('ZCS.controller.mail.ZtConvController').getItem(),
					msg, i, convId,
					messages = [];

				records.each(function(msg) {
					convId = conv.get('id');
					if (msg.get('convId') === convId) {
						messages.push(msg);
					}
					else {
						console.log('conv ID ' + msg.get('convId') + ' in msg does not match current conv ID ' + convId);
					}
				}, this);

				conv.setMessages(messages);
			}
		}
	}
});
