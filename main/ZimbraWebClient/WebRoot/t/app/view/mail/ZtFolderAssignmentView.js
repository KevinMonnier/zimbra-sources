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
 * This class shows a user a list of folders to apply to the configured component/record.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.view.mail.ZtFolderAssignmentView', {
	extend: 'ZCS.view.mail.ZtAssignmentView',
	alias: 'widget.moveview',
	constructor: function (config) {

		cfg = config || {};

		cfg.listItemTpl = ZCS.template.FolderAssignmentListItem;
		cfg.listData = ZCS.common.ZtUserSession.getOrganizerDataByAppAndOrgType(ZCS.constant.APP_MAIL, ZCS.constant.ORG_MAIL_FOLDER);
		cfg.listDataModel = 'ZCS.model.ZtOrganizer';

		this.callParent([cfg]);
	}
});