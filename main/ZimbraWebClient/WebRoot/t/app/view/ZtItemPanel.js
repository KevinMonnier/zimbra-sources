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
 * Base class for a panel that displays a single item. It has a toolbar at the top, and the item is
 * displayed below. The toolbar has a button that will show an action menu for the item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtItemPanel', {

	extend: 'Ext.Container',

	requires: [
		'Ext.dataview.List',
		'ZCS.view.ux.ZtLeftTitleBar'
	],

	xtype: 'itempanel',

	config: {
		layout: 'fit',
		cls:    'zcs-item-panel',
		app:    null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp(),
			items = [],
			buttons = ZCS.constant.ITEM_BUTTONS[app],
			ln = buttons ? buttons.length : 0,
			i, button;

		function createHandler(event, params) {
			return function() {
				this.up('titlebar').fireEvent(event, this, params);
			}
		}

		for (i = 0; i < ln; i++) {
			var button = buttons[i];
			items.push({
				xtype:      'button',
				iconCls:    button.icon,
				cls:        'zcs-flat',
				iconMask:   true,
				align:      'right',
				handler:    createHandler(button.event, { menuName: button.menuName }),
				hidden:     true
			});
		}

		items.push({
			xtype: 'button',
			align: 'left',
			itemId: 'listpanelToggle',
			hidden: true
		});

		var toolbar = {
			xtype:  'lefttitlebar',
			docked: 'top',
			items:  items
		};

		var itemView = {
			xtype: app + 'itemview'
		};

		this.add([
			toolbar,
			itemView
		]);

		if (app === ZCS.constant.APP_MAIL && ZCS.constant.IS_ENABLED[ZCS.constant.FEATURE_QUICK_REPLY]) {
			var quickReply = {
				xtype: 'container',
				itemId: 'quickReply',
				docked: 'bottom',
				cls: 'zcs-quick-reply',
				hidden: true,
				layout: 'hbox',
				items: [{
					xtype: 'fieldset',
					flex: 1,
					items: [
						{
							flex: 1,
							xtype: 'textareafield',
							placeholder: 'Test Placeholder',
							height: ZCS.constant.QUICK_REPLY_SMALL
						}
					]
				},{
					xtype: 'button',
					text: ZtMsg.send,
					ui: 'neutral',
					padding: '0 1em',
					handler: function() {
						ZCS.app.fireEvent('sendQuickReply');
//							this.up('#quickReply').fireEvent('sendQuickReply');
					}
				}]
			}
			this.add(quickReply);
		}
	},

	setTitle: function(title) {
		this.down('title').setTitle(title);
	},

	showButtons: function() {
		Ext.each(this.down('titlebar').query('button'), function(button) {
			//The list panel toggle is a special button that is hidden/shown based on
			//other factors.
			if (button.getItemId() !== 'listpanelToggle') {
				button.show();
			}
		}, this);
	},

	updatelistpanelToggle: function (title) {
		var listpanelToggle = this.down('#listpanelToggle');

		if (title) {
			listpanelToggle.show();
			listpanelToggle.setText(title);
		} else {
			listpanelToggle.hide();
		}
	},

	hideButtons: function() {
		Ext.each(this.down('titlebar').query('button'), function(button) {
			button.hide();
		}, this);
	}
});
