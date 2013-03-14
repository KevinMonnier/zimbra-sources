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
 * Base class for controllers that handle items (messages, convs, contacts etc).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.ZtBaseController', {

	extend: 'Ext.app.Controller',

	config: {
		menus:          {},
		menuButtons:    {},
		menuConfigs:    {}
	},

	/**
	 * Returns the store that holds the data this controller is managing.
	 *
	 * @return {Ext.data.Store}     store
	 */
	getStore: function() {
		return Ext.getStore(ZCS.util.getStoreShortName(this));
	},

	getMenu: function(menuName) {
		return this.getMenus()[menuName];
	},

	getMenuButton: function(menuName) {
		return this.getMenuButtons()[menuName];
	},

	getMenuConfig: function(menuName) {
		return this.getMenuConfigs()[menuName];
	},

	setMenu: function(menuName, menu) {
		this.getMenus()[menuName] = menu;
	},

	setMenuButton: function(menuName, button) {
		this.getMenuButtons()[menuName] = button;
	},

	setMenuConfig: function(menuName, config) {
		this.getMenuConfigs()[menuName] = config;
	},

	/**
	 * Sets up the action menu, creating a listener for each action.
	 */
	setMenuItems: function(menuName) {
		var menuData = this.getMenuConfig(menuName);
		Ext.each(menuData, function(menuItem) {
			menuItem.listener = this[menuItem.listener];
			menuItem.scope = this;
		}, this);
		this.getMenu(menuName).setMenuItems(menuData);
	},

	/**
	 * Displays the action menu after the dropdown button on the toolbar has been tapped.
	 */
	doShowMenu: function(menuButton) {

		var menuName = menuButton.menuName,
			menu = this.getMenu(menuName);

		if (!menu) {
			menu = Ext.create('ZCS.common.ZtMenu', {
				name: menuName,
				enableItemsFn: this.enableMenuItems,
				enableItemsScope: this
			});
			this.setMenu(menuName, menu);
			this.setMenuItems(menuName);
		}
		this.setMenuButton(menuName, menuButton);
		menu.setReferenceComponent(menuButton);
		menu.popup();
	},

	/**
	 * Override this function to enable/disable menu items after menu has popped up
	 */
	enableMenuItems: function(menuName, items) {},

	/**
	 * Delete notification: remove item from the store
	 *
	 * @param {string}  id      ID of item that was deleted
	 */
	handleDeleteNotification: function(id) {
		var item = ZCS.cache.get(id);
		if (item) {
			this.getStore().remove(item);
		}
	},

	/**
	 * Create notification: convert item JSON to data, then use that
	 * to instantiate a new model and add it to the store.
	 */
	handleCreateNotification: function(create) {},

	/**
	 * Modify notification: let the item handle it
	 *
	 * @param {ZtItem}  item        item that was changed
	 * @param {object}  modify      JSON detailing the changes (each changed field and its new value)
	 */
	handleModifyNotification: function(item, modify) {
		item.handleModifyNotification(modify);
	}
});
