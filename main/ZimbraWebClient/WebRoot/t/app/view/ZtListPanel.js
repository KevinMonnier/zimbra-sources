/**
 * A list panel consists of three components: A header describing the list contents in general, a search box, and a list
 * of items. The header has a button on the left to show the folder tree, and a button on the right to create a new
 * item.
 */
Ext.define('ZCS.view.ZtListPanel', {

	extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.List',
		'Ext.TitleBar',
		'Ext.field.Search',

		'ZCS.view.mail.ZtConvListView',
		'ZCS.view.contacts.ZtContactListView'
	],

	xtype: 'listpanel',

	config: {
		layout: 'fit',
		style:  'border: solid blue 1px;',

		app: null,
		newButtonIcon: null,
		storeName: null
	},

	initialize: function() {

		this.callParent(arguments);

		var app = this.getApp();

		var listToolbar = {
			docked: 'top',
			xtype: 'titlebar',
			title: '',
			items: [
				{
					xtype: 'button',
					handler: function() {
						this.up('listpanel').fireEvent('showFolders');
					},
					iconCls: 'list',
					iconMask: true,
					align: 'left'
				},
				{
					xtype: 'button',
					handler: function() {
						this.up('listpanel').fireEvent('newItem');
					},
					iconCls: this.getNewButtonIcon(),
					iconMask: true,
					align: 'right'
				}
			]
		};

		var searchToolbar = {
			docked: 'top',
			xtype: 'toolbar',
			items: [
				{
					xtype: 'searchfield',
					name: 'searchField',
					width: '95%',
					listeners: {
						keyup: function(fld, ev) {
							var keyCode = ev.browserEvent.keyCode;
							if (keyCode === 13 || keyCode === 3) {
								this.fireEvent('search', fld.getValue());
							}
						}
					}
				}
			]
		};

		var listView = {
			xtype: app + 'listview',
			store: Ext.getStore(this.getStoreName())
		}

		this.add([
			listToolbar,
			searchToolbar,
			listView
		]);
	}
});
