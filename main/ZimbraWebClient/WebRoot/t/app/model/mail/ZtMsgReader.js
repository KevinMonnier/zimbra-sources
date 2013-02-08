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
 * This class translates JSON for a message into a ZtMailMsg.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.mail.ZtMsgReader', {

	extend: 'ZCS.model.mail.ZtMailReader',

	requires: [
		'ZCS.model.mail.ZtMimePart'
	],

	alias: 'reader.msgreader',

	/**
	 * Override so we can figure out which message will be the last one displayed, so we know not
	 * to hide its quoted content.
	 */
	getRecords: function(root) {

		var records = [],
			lastIndex = root.length - 1,
			idx = 0;

		// Invert the list and find the first displayable (non-Trash, non-Junk) message
		Ext.each(root.reverse(), function(node, index) {
			if (node.l && !ZCS.constant.CONV_HIDE[node.l]) {
				idx = index;
				return false;
			}
		}, this);
		lastIndex = lastIndex - idx;

		Ext.each(root, function(node, index) {
			records.push({
				clientId: null,
				id: node.id,
				data: this.getDataFromNode(node, index === lastIndex),
				node: node
			});
		}, this);

		return records;
	},

	getDataFromNode: function(node, isLast) {

		var data = {},
			ctxt;

		data.itemId = node.id;
		data.type = ZCS.constant.ITEM_MESSAGE;
		data.folderId = node.l;
		data.fragment = node.fr;
		data.convId = node.cid;
		data.subject = node.su;
		this.parseFlags(node, data);

		data.addresses = ZCS.model.mail.ZtMailItem.convertAddresses(node.e);

		data.dateStr = ZCS.model.mail.ZtMailItem.getDateString(node.d);

		if (node.mp) {
			ctxt = {
				attachments:    [],
				bodyParts:      [],
				contentTypes:   {}
			}
			data.topPart = ZCS.model.mail.ZtMimePart.fromJson(node.mp[0], ctxt);
			data.attachments = ctxt.attachments;
			data.bodyParts = ctxt.bodyParts;
			data.contentTypes = ctxt.contentTypes;
			data.isLoaded = !!(data.bodyParts.length > 0 || data.attachments.length > 0);
		}

		data.isLast = isLast;

		return data;
	}
});
