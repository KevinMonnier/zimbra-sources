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
* @class ZCS.view.contacts.ZtContactField
*
* This class allows a user to perform type ahead search on contacts,
* and then add multiple contacts to this field.
*
*/
Ext.define('ZCS.view.contacts.ZtContactField', {
	extend: 'ZCS.view.ux.ZtBubbleDropdown',
	alias: 'widget.contactfield',
	config: {

		//TODO: if a contact model is no longer used, return perhaps an email model.
		getBubbleModelFromInput: function (input) {
			var emailObject = Ext.create('ZCS.model.mail.ZtEmailAddress', {
					email: input
				});

			if (emailObject.isValid()){
				return Ext.create('ZCS.model.address.ZtAutoComplete', {
					'email': input
				});
			} else {
				return false;
			}
		},
		bubbleDisplayField: 'viewName',

		menuItemTpl: [
			'<tpl if="name">',
			'<span class="zcs-auto-complete-name">{name}</span>',
			'</tpl>',
			'<tpl if="email">',
			'<span class="zcs-auto-complete-email">{email}</span>',
			'</tpl>'
		],

		remoteFilter: true,

		menuWidth: 300
	},

	configureStore: function (value, store) {
		store.getProxy().setExtraParams({
			'name': value
		});
	},

	initialize: function () {
		var store = Ext.create('ZCS.store.address.ZtAutoCompleteStore');

		this.setMenuStore(store);
	},
	/**
	 * Called by default EXT form functionality to retrieve the value of this form input.
	 */
	getValue: function () {
		var bubbles = this.getBubbles(),
			returnBubbles = [];

		//TODO, remove this when what is in the store is the desired ZtEmailAddress.
		Ext.each(bubbles, function (bubbleModel) {
			returnBubbles.push(Ext.create('ZCS.model.mail.ZtEmailAddress', {
				name: bubbleModel.get('name'),
				email: bubbleModel.get('email')
 			}));
		});

		return returnBubbles;
	}
})