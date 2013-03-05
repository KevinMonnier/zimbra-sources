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
 * Base class for a panel that displays a single item. It has a toolbar at the top, and the item is
 * displayed below. The toolbar has a button that will show an action menu for the item.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtItemPanel', {

	extend: 'Ext.Container',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar'
	],

	xtype: 'itempanel',

	config: {
		layout: 'fit',
		app: null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp();

		var toolbar = {
			xtype: 'titlebar',
			docked: 'top',
		    cls: 'zcs-item-titlebar',
			items: [
				{
					xtype: 'button',
					iconCls: 'trash',
					itemId: 'trashBtn',
					cls: 'zcs-flat',
					iconMask: true,
					align: 'right',
					handler: function() {
						this.up('titlebar').fireEvent('delete', this);
					},
					hidden: true
				}, {
					xtype: 'button',
					iconCls: 'arrow_down',
					cls: 'zcs-flat',
					itemId: 'menuBtn',
					iconMask: true,
					align: 'right',
					handler: function() {
						this.up('titlebar').fireEvent('showMenu', this);
					},
					hidden: true
				}
			]
		};

		var itemView = {
			xtype: app + 'itemview'
		};

		this.add([
			toolbar,
			itemView
		]);
	},

	showMenuButton: function () {
		this.down('.titlebar #trashBtn').show();
		this.down('.titlebar #menuBtn').show();
	},

	hideMenuButton: function () {
		this.down('.titlebar #trashBtn').hide();
		this.down('.titlebar #menuBtn').hide();
	}


});
