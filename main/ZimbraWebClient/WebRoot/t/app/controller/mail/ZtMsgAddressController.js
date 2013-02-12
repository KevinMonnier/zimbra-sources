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
 * This class manages the interactions with addresses displayed as part of a message.
 *
 * @see ZtMailMsg
 * @author Macy Abbey
 */
Ext.define('ZCS.controller.mail.ZtMsgAddressController', {

	extend: 'ZCS.controller.mail.ZtMailItemController',

	config: {

		models: ['ZCS.model.mail.ZtMailMsg'],
		stores: ['ZCS.store.mail.ZtMsgStore'],

		refs: {
			msgHeader: 'msgheader'
		},

		control: {
			msgHeader: {
				bubbleHold: 'doAddressMenu'
			}
		}
	},

	doAddressMenu: function(element, msg, address) {
		this.setItem(msg);
		this.address = address;

		if (this.itemMenu) {
			this.itemMenu.destroy();
		}

		this.itemMenu = Ext.create('ZCS.common.ZtMenu', {
			referenceComponent: element,
			width: 180
		});
			
		this.itemMenu.setMenuItems([
			{label: 'Add to Contacts', action: '', listener: Ext.bind(this.doAddToContacts, this, [msg])},
			{label: 'New Message', action: '', listener: Ext.bind(this.doNewMessage, this, [msg])}
		]);

		this.itemMenu.popup();
	},

	doAddToContacts: function () {
		var addressToAdd = this.address;

		//TODO, determine how to add an address to contacts, should this pop up a dialog?
	},

	doNewMessage: function (msg) {
		var toAddress = this.address,
			messageObject = msg.getAddressObject('email', toAddress);

		ZCS.app.getComposeController().showComposeForm([messageObject]);
	}
});