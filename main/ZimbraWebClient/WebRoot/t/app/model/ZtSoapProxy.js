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
 * This class is a simple SOAP proxy for talking to the Zimbra server.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.model.ZtSoapProxy', {

	extend: 'Ext.data.proxy.Ajax',

	alias: 'proxy.soapproxy',

	/**
	 * Override so we can handle the inlined initial search results, which are then cleared so
	 * that we only do this once.
	 */
	doRequest: function(operation, callback, scope) {

		var me = this,
			inlineResults = ZCS.session.getInitialSearchResults();

		if (inlineResults) {

			// cobble together the appropriate request so that we can pretend it was used to get
			// these results
			var request = me.buildRequest(operation),
				response;

			operation.config.query = ZCS.session.getSetting(ZCS.constant.SETTING_INITIAL_SEARCH);

			request.setConfig({
				headers  : me.getHeaders(),
				timeout  : me.getTimeout(),
				method   : me.getMethod(request),
				callback : me.createRequestCallback(request, operation, callback, scope),
				scope    : me,
				proxy    : me
			});
			request.soapMethod = 'Search';

			var data = {
				Body: {
					SearchResponse: inlineResults
				}
			};

			// cobble together a response that contains the results we already have
			response = {
				request: request,
				requestId : request.id,
				status : 200,
				statusText : 'OK',
				getResponseHeader : function(header) {
					return '';
				},
				getAllResponseHeaders : function() {
					return {};
				},
				responseText : data
			};

			// Go!
			this.processResponse(true, operation, request, response, callback, scope);

			// Erase the canned results since we only do this once.
			ZCS.session.setInitialSearchResults(null);
		}
		else {
			return me.callParent(arguments);
		}
	},

	/**
	 * When we get the response to a search request, set the text in the search field to the
	 * search query if the user wants to see it.
	 */
	processResponse: function(success, operation, request, response, callback, scope) {

		var query = operation.config.query,
			search;

		if (query && success) {
			search = Ext.create('ZCS.common.ZtSearch', {
				query: query
			});
			ZCS.session.setSetting(ZCS.constant.SETTING_CUR_SEARCH, search);
			if (ZCS.session.getSetting(ZCS.constant.SETTING_SHOW_SEARCH)) {
				ZCS.session.getCurrentSearchField().setValue(query);
			}
		}
		this.callParent(arguments);

		this.processHeader(response.soapHeader);
	},

	processHeader: function(header) {

		var context = header && header.context,
			notifications = context && context.notify,
			refresh = context && context.refresh;

		if (notifications) {
			this.handleNotifications(notifications);
		}

		if (refresh) {
			this.handleRefresh(refresh);
		}
	},

	handleNotifications: function(notifications) {

		// TODO: check for stale notifications based on seq


		Ext.each(notifications, function(notify) {
			this.normalizeNotifications(notify);
			if (notify.deleted) {
				this.handleDeletes(notify.deleted);
			}
			if (notify.created) {
				this.handleCreates(notify.created);
			}
			if (notify.modified) {
				this.handleModifies(notify.modified);
			}
		}, this);
	},

	/**
	 * A delete notification indicates a 'hard delete', where an item has been removed from
	 * the server. Moving an item to Trash is a 'soft delete', and will generate a 'modified'
	 * notification indicating a move into the Trash folder.
	 *
	 * @param {object}   deleted        list of deleted IDs by node type
	 */
	handleDeletes: function(deleted) {

		var item, itemType, ctlr;

		Ext.each(deleted.id, function(id) {
			item = ZCS.cache.get(id);
			itemType = item && item.get('type');
			// TODO: handle this with an event rather than a function call
			ctlr = ZCS.app.getController(ZCS.constant.LIST_CONTROLLER[itemType]);
			if (ctlr && ctlr.handleDeleteNotification) {
				ctlr.handleDeleteNotification(item);
			}
		}, this);
	},

	handleCreates: function(creates) {

		var itemType, ctlr;

		Ext.each(ZCS.constant.NODES, function(nodeType) {
			Ext.each(creates[nodeType], function(create) {
				itemType = ZCS.constant.NODE_ITEM[nodeType];
				ctlr = ZCS.app.getController(ZCS.constant.LIST_CONTROLLER[itemType]);
				// TODO: handle this with an event rather than a function call
				if (ctlr && ctlr.handleCreateNotification) {
					ctlr.handleCreateNotification(create);
				}
			}, this);
		}, this);
	},

	handleModifies: function(modifies) {

		var item, itemType, ctlr;

		Ext.each(ZCS.constant.NODES, function(nodeType) {
			Ext.each(modifies[nodeType], function(modify) {
				item = ZCS.cache.get(modify.id);
				// TODO: handle this with an event rather than a function call
				itemType = item && item.get('type');
				ctlr = ZCS.app.getController(ZCS.constant.LIST_CONTROLLER[itemType]);
				if (ctlr && ctlr.handleModifyNotification) {
					ctlr.handleModifyNotification(item, modify);
				}
				else {
					Ext.Logger.warn('Could not find modified item ' + modify.id);
				}
			}, this);
		}, this);
	},

	handleRefresh: function(refresh) {
	},

	/**
	 * Normalize the notifications that occur when a virtual conv gets promoted to a real conv.
	 * For example, a virtual conv with ID -676 and one msg (ID 676) receives a second msg (ID 677)
	 * and becomes a real conv with an ID of 678. The following notifications will arrive:
	 *
	 *		deleted:	-676
	 *		created:	c {id:678, n:2}
	 *					m {id:677, cid:678}
	 *		modified:	m {id:676, cid:678}
	 *
	 * Essentially, we want to handle this as:
	 *
	 * 		created:	m {id:677, cid:678}
	 *		modified:	c {id:-676, _newId: 678}
	 * 					m {id:676, cid:678}
	 *
	 * @adapts ZmMailApp.prototype.preNotify
	 * @private
	 */
	normalizeNotifications: function(notifications) {

		var deletes = notifications.deleted,
			creates = notifications.created,
			modifies = notifications.modified;

		if (!deletes || !creates || !modifies) {
			return notifications;
		}

		// first, see if we are deleting any virtual convs (which have negative local IDs)
		var virtConvDeleted = false,
			deletedIds = deletes.id && deletes.id.split(','),
			virtConv = {},
			newDeletedIds = [],
			parsedId, id;

		Ext.each(deletedIds, function(id) {
			parsedId = ZCS.util.parseId(id);
			if (parsedId.localId < 0) {
				virtConv[id] = true;
				virtConvDeleted = true;
			} else {
				newDeletedIds.push(id);
			}
		}, this);

		if (!virtConvDeleted) {
			return notifications;
		}

		// look for creates of convs that mean a virtual conv got promoted
		var gotNewConv = false,
			createdMsgs = {},
			createdConvs = {},
			name, create, id;

		for (name in creates) {
			Ext.each(creates[name], function(create) {
				id = create.id;
				if (name === 'm') {
					createdMsgs[id] = create;
				}
				else if (name === 'c' && (create.n > 1)) {
					// this is *probably* a create for a real conv from a virtual conv
					createdConvs[id] = create;
					gotNewConv = true;
				}
			}, this);
		}

		if (!gotNewConv) {
			return notifications;
		}

		// last thing to confirm virt conv promotion is msg changing cid
		var msgMoved = false,
			newToOldCid = {},
			movedMsgs = {},
			list = modifies.m,
			virtCid, msg;

		Ext.each(list, function(mod) {
			id = mod.id;
			parsedId = ZCS.util.parseId(id);
			virtCid = parsedId.localId * -1;
			if (virtConv[virtCid] && createdConvs[mod.cid]) {
				msgMoved = true;
				movedMsgs[id] = mod;
				newToOldCid[mod.cid] = virtCid;
				createdConvs[mod.cid]._wasVirtConv = true;
				createdConvs[mod.cid].m = [{id:id}];
				// TODO: step below needed?
				// go ahead and update the msg cid, since it's used in
				// notification processing for creates
				msg = ZCS.cache.get(id);
				if (msg) {
					msg.set('convId', mod.cid);
				}
			}
		}, this);

		if (!msgMoved) {
			return notifications;
		}

		// We're promoting virtual convs. Normalize the notifications object, and
		// process a preliminary notif that will update the virtual conv's ID to its
		// new value.

		// First, remove virt convs from the list of deleted IDs
		if (newDeletedIds.length) {
			notifications.deleted.id = newDeletedIds.join(',');
		} else {
			delete notifications.deleted;
		}

		// get rid of creates for promoted virtual convs, since they aren't really creates
		var tmp = [],
			list = creates.c,
			c;

		Ext.each(list, function(create) {
			c = createdConvs[create.id];
			if (!(c && c._wasVirtConv)) {
				tmp.push(create);
			}
		}, this);

		if (tmp.length > 0) {
			notifications.created.c = tmp;
		} else {
			delete notifications.created.c;
		}

		// TODO: step below needed?
		// if the first msg matched the current search, we'll want to use the conv
		// create node to create the conv later, so save it
/*
		for (id in createdMsgs) {
			var msgCreate = createdMsgs[id];
			var convCreate = createdConvs[msgCreate.cid];
			if (convCreate && convCreate._wasVirtConv) {
				msgCreate._convCreateNode = convCreate;
			}
		}
*/

		// create modified notifs for the virtual convs that have been promoted, using
		// the create notif for the conv as a base
		var newMods = [];
		for (var cid in newToOldCid) {
			var node = createdConvs[cid];
			node.id = newToOldCid[cid];
			node.newId = cid;
			newMods.push(node);
		}

		// Go ahead and process these changes, which will change the ID of each promoted conv
		// from its virtual (negative) ID to its real (positive) one. That will replace the DOM
		// IDs of that conv's elements with ones that reflect the new conv ID.
/*
		if (newMods.length) {
			var mods = {};
			mods["c"] = newMods;
			appCtxt.getRequestMgr()._handleModifies(mods);
		}
*/
	}
});
