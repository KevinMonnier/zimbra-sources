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
 * This class is a NestedList that shows a folder tree. The main reason we subclass NestedList is so
 * that we can use the disclosure button to expand a folder (rather than show a detail card), and tap
 * to perform a folder search (rather than expand the folder).
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.ZtOrganizerList', {

	extend: 'Ext.dataview.NestedList',

	xtype: 'folderlist',

	config: {

		cls: 'zcs-folder-list',

		// Show the folder's child list.
		onItemDisclosure: function(record, item, index, e) {

			// This event is scoped to the sub-list that caught it, so we need to get the top-level nested
			// list to expand the node, as a sub-list only knows how to display a flat series of items.
			var list = item.dataview,
				store = list.getStore(),
				node = store.getAt(index),
				nestedList = this.up('nestedlist');

			nestedList.goToNode(node);
		}
	},

	/**
	 * Runs a search that will show the folder's contents.
	 */
	onItemTap: function(list, index, target, folder, e) {
		this.fireEvent('search', folder.getQuery(), folder);
	},

	/**
	 * Returns the folder with the given ID.
	 *
	 * @param {string}  id      folder ID
	 * @return {ZtFolder}       folder
	 */
	getById: function(id) {
		return this.getStore().getById(id);
	},

	/**
	 * Override Ext.dataview.NestedList.getList to propagate grouping info from
	 * parent NestedList to List sublist.
	 */
	getList: function(node) {

		var list = this.callParent(arguments);

		list.grouped = this.grouped;
		list.store.setGrouper(this.getStore().config.grouper);

		return list;
	}
});
