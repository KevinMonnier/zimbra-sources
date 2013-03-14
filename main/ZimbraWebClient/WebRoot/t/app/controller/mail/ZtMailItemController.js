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
 * Base class for a controller that manages a single mail item.
 *
 * @see ZtItemPanel
 * @see ZtMailItem
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtMailItemController', {

	extend: 'ZCS.controller.ZtItemController',

	requires: [
		'ZCS.view.mail.ZtFolderAssignmentView',
		'ZCS.view.mail.ZtTagAssignmentView'
	],

	config: {
		/**
		 * This is the mail component which contains the menu that has been triggered.  Since the menu
		 * implementation is entirely decoupled from its component context, this seems the only reasonable
		 * way to re-establish that context.
		 */
		activeMailComponent: null
	},

	/**
	 * Returns the message that an operation should be applied to.
	 */
	getActiveMsg: function() {},

	/**
	 * Launches a move assignment view.
	 */
	doMove: function(item) {
		this.doAssignmentView(item, 'ZCS.view.mail.ZtFolderAssignmentView', ZtMsg.folders, 'folderView');
	},

	/**
	 * Launches a tag assignment view.
	 */
	doTag: function(item) {
		this.doAssignmentView(item, 'ZCS.view.mail.ZtTagAssignmentView', ZtMsg.tags, 'tagView');
	},

	/**
	 * Launches an assignment view
	 */
	doAssignmentView: function (item, view, listTitle, viewProp) {
		var targetComp = Ext.Viewport.down('tabpanel'),
			activeComp = this.getActiveMailComponent(),
			activeList = activeComp.down('list'),
			activeStore = activeList.getStore(),
			item = item || this.getItem(),
			contentHeight,
			isMessage = item instanceof ZCS.model.mail.ZtMailMsg;


		if (isMessage) {
			activeStore.filter('id', item.get('id'));
		}

		activeList.setReadOnly(true);

		contentHeight = activeList.getItemMap().getTotalHeight();

		//To account for the panel header
		contentHeight += 20;

		if (!this[viewProp]) {
			this[viewProp] = Ext.create(view, {
				targetElement: targetComp.bodyElement,
				record: item || this.getItem(),
				listTitle: listTitle,
				onAssignmentComplete: function () {
					activeComp.showButtons();
					activeList.setReadOnly(false);
					//undo any filtering we may have done
					activeStore.clearFilter();
				}
			});
		}

		activeComp.hideButtons();
		this[viewProp].showWithComponent(activeComp, item, contentHeight);
	},

	/**
	 * Make sure the action menu shows the appropriate action based on the unread status of this conversation.
	 * The action will be either Mark Read or Mark Unread.
	 */
	doShowMenu: function(menuButton) {

		var itemPanel = menuButton.up('.itempanel');
		if (!itemPanel) {
			var itemPanelEl = menuButton.up('.zcs-item-panel');
			itemPanel = itemPanelEl && Ext.getCmp(itemPanelEl.id);
		}
		this.setActiveMailComponent(itemPanel);

		var menuName = menuButton.menuName,
			menu = this.getMenu(menuName),
			item = this.getItem(),
			unreadLabel = item.get('isUnread') ? ZtMsg.markRead : ZtMsg.markUnread,
			flagLabel = item.get('isFlagged') ? ZtMsg.unflag : ZtMsg.flag;

		if (menu) {
			var list = menu.down('list'),
				store = list.getStore(),
				unreadAction = list.getItemAt(store.find('action', 'MARK_READ')),
				flagAction = list.getItemAt(store.find('action', 'FLAG'));

			if (unreadAction) {
				unreadAction.getRecord().set('label', unreadLabel);
			}
			if (flagAction) {
				flagAction.getRecord().set('label', flagLabel);
			}
		}
		else {
			// first time showing menu, change data since menu not ready yet
			var menuData = this.getMenuConfig(menuName);
			Ext.each(menuData, function(menuItem) {
				if (menuItem.action === 'MARK_READ') {
					menuItem.label = unreadLabel;
				}
				if (menuItem.action === 'FLAG') {
					menuItem.label = flagLabel;
				}
			}, this);
		}
		this.callParent(arguments);
	},

	/**
	 * Disable "Tag" action if user doesn't have any tags.
	 */
	enableMenuItems: function(menuName) {
		var menu = this.getMenu(menuName);
		if (menu && menu.getItem(ZCS.constant.OP_TAG)) {
			var tags = ZCS.session.getOrganizerDataByAppAndOrgType(ZCS.constant.APP_MAIL, ZCS.constant.ORG_TAG);
			menu.enableItem(ZCS.constant.OP_TAG, tags && tags.length > 0);
		}
	},

	/**
	 * Saves the item and tags it.
	 *
	 * @param {ZtOrganizer}     tag     tag to apply or remove
	 * @param {ZtMailitem}      item    item to tag or untag
	 * @param {Boolean}         remove  if true, remove given tag from the item
	 */
	saveItemTag: function (tag, item, remove) {
		this.tagItem(item, tag.get('name'), false);
	},

	/**
	 * Saves the item and moves it into the selected folder.
	 *
	 * @param {ZtOrganizer}     folder      target folder
	 * @param {ZtMailItem}      item        item to move
	 */
	saveItemMove: function (folder, item) {

		var data = {
			op: 'move',
			l:  folder.get('id')
		};

		this.performOp(item, data, function(item, operation) {
			var isConversation = item instanceof ZCS.model.mail.ZtConv,
				isMessage = item instanceof ZCS.model.mail.ZtMailMsg,
				conv;

			if (isMessage) {
				conv = ZCS.cache.get(item.get('convId'));
			} else {
				conv = item;
			}

			if (!isMessage || conv.get('numMsgs') === 1) {
				ZCS.app.getConvListController().removeConv(conv);
			}
		});

	},

	/**
	 * Starts a reply session with the active message as the original message.
	 */
	doReply: function() {
		ZCS.app.getComposeController().reply(this.getActiveMsg());
	},

	/**
	 * Starts a reply-all session with the active message as the original message.
	 */
	doReplyAll: function() {
		ZCS.app.getComposeController().replyAll(this.getActiveMsg());
	},

	/**
	 * Do a delete originating from a button.  This drops the button parameter and
	 * allows doDelete to be used by both a button and the standard menu behavior.
	 */
	doButtonDelete: function() {
		this.doDelete();
	},

	/**
	 * Moves the mail item to Trash.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doDelete: function(item) {
		this.lastDeletedItem = item;

		item = item || this.getItem();

		this.performOp(item, 'trash', function (item) {
			//Because a conversation trash can occur when messages are not present in the UI,
			//our standard notificaiton logic won't work, so manually force a removal.
			if (item.get('type') === ZCS.constant.ITEM_CONVERSATION) {
				ZCS.app.getConvListController().removeConv(item);
			}
			//TODO: Where should we get trash from? ZtUserSession in ZtUserOrganizers?
			ZCS.app.fireEvent('showToast', Ext.String.format(ZtMsg.moveMessage, 'Trash'), this.undoDelete, this);
		});
	},

	undoDelete: function () {

	},

	/**
	 * Moves the mail item to Junk.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doSpam: function(item) {
		this.performOp(item, 'spam');
	},

	/**
	 * Toggles read/unread on the mail item.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doMarkRead: function(item) {
		item = item || this.getItem();
		this.performOp(item, item.get('isUnread') ? 'read' : '!read');
	},

	/**
	 * Toggles the flagged state of the mail item.
	 *
	 * @param {ZtMailItem}   item     mail item
	 */
	doFlag: function(item) {
		item = item || this.getItem();
		this.performOp(item, item.get('isFlagged') ? '!flag' : 'flag');
	}
});
