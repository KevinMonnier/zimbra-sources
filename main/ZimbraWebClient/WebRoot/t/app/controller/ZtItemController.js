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
 * Base class for a controller that manages a single item. It handles item actions initiated by a dropdown action menu
 * anchored to the toolbar, or from within the item itself.
 *
 * @see ZtItemPanel
 * @see ZtItem
 * @author Conrad Damon <cdamon@zimbra.com>
 */

Ext.define('ZCS.controller.ZtItemController', {

	extend: 'ZCS.controller.ZtBaseController',

	requires: [
		'ZCS.common.ZtMenu'
	],

	config: {

		refs: {
			itemPanelToolbar: '',
			itemPanel: ''
		},

		control: {
			itemPanelToolbar: {
				showMenu: 'doShowMenu'
			}
		},

		item: null
	},

	launch: function () {
		Ext.Logger.verbose('STARTUP: item ctlr launch - ' + ZCS.util.getClassName(this));
		this.callParent();
	},

	/**
	 * Clears the content of the toolbar and hides the dropdown button.
	 */
	clear: function() {
		this.getItemPanelToolbar().setTitle('');
		this.getItemPanel().hideButtons();
	},

	/**
	 * Displays the given item in a ZtItemPanel.
	 *
	 * @param {ZtItem}  item        the item
	 */
	showItem: function(item) {
		this.clear();
		this.setItem(item);
		this.getItemPanel().showButtons();
	},

	/**
	 * Performs a simple server operation on an item. Generally that means some sort of
	 * ActionRequest with an 'op' attribute and possibly other arguments.
	 *
	 * @param {ZtItem}          item    item to act on
	 * @param {Object|String}   data    data to save, or op to perform
	 * @param {Function} success    The function to run on succes.
	 */
	performOp: function(item, data, callback) {
		item = item || this.getItem();
		if (item) {
			if (Ext.isString(data)) {
				data = { op: data };
			}
			data.success = function(item, operation) {
				Ext.Logger.info('item op ' + data.op + ' done');
				if (callback) {
					callback(item);
				}
			};
			item.save(data);
		}
	},

	/**
	 * Adds or removes a tag to/from the given item.
	 *
	 * @param {ZtMailItem}  item        mail item
	 * @param {String}      tagName     name of tag to add or remove
	 * @param {Boolean}     remove      if true, remove the tag
	 */
	tagItem: function(item, tagName, remove) {
		this.performOp(item, {
			op: remove ? '!tag' : 'tag',
			tn: tagName
		}, function() {
			var toastMsg = remove ? ZtMsg.messageTagRemoved : ZtMsg.messageTagged;
			ZCS.app.fireEvent('showToast', Ext.String.format(toastMsg, tagName));
		});
	}
});
