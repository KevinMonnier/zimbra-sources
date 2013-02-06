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
 * This static class collects all the constants needed by ZCS in one place, rather than
 * partitioning them into the classes they're related to. We trade organization for
 * convenience, since the code will never have to worry about whether the defining class
 * has been loaded.
 *
 * Use of the shortcut ZCS.constant is recommended for defining and accessing these constants.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.common.ZtConstants', {

	singleton: true,

	alternateClassName: 'ZCS.constant',

	getBackMap: function(map) {
		var backMap = {}, key;
		for (key in map) {
			backMap[map[key]] = key;
		}
		return backMap;
	}
});

// URL portion that precedes a server API call
ZCS.constant.SERVICE_URL_BASE = '/service/soap/';

// Apps
ZCS.constant.APP_MAIL     = 'mail';
ZCS.constant.APP_CONTACTS = 'contacts';

// Order of app tabs
ZCS.constant.APPS = [
	ZCS.constant.APP_MAIL,
	ZCS.constant.APP_CONTACTS
];

// Text for tab bar
ZCS.constant.TAB_TITLE = {};
ZCS.constant.TAB_TITLE[ZCS.constant.APP_MAIL]       = ZtMsg.mail;
ZCS.constant.TAB_TITLE[ZCS.constant.APP_CONTACTS]   = ZtMsg.contacts;

// Title to show in overview
ZCS.constant.OVERVIEW_TITLE = {};
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_MAIL]       = ZtMsg.folders;
ZCS.constant.OVERVIEW_TITLE[ZCS.constant.APP_CONTACTS]   = ZtMsg.addrbooks;

// Icon for button that creates a new item
ZCS.constant.NEW_ITEM_ICON = {};
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_MAIL]       = 'compose';
ZCS.constant.NEW_ITEM_ICON[ZCS.constant.APP_CONTACTS]   = 'plus';

// Item types as known by server
ZCS.constant.ITEM_CONVERSATION = 'conversation';
ZCS.constant.ITEM_MESSAGE      = 'message';
ZCS.constant.ITEM_CONTACT      = 'contact';

// App to which each item type belongs
ZCS.constant.APP_FOR_TYPE = {};
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CONVERSATION]  = ZCS.constant.APP_MAIL;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_MESSAGE]       = ZCS.constant.APP_MAIL;
ZCS.constant.APP_FOR_TYPE[ZCS.constant.ITEM_CONTACT]       = ZCS.constant.APP_CONTACTS;

// Model class for each item type
ZCS.constant.CLASS_FOR_TYPE = {};
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CONVERSATION]    = 'ZCS.model.mail.ZtConv';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_MESSAGE]         = 'ZCS.model.mail.ZtMailMsg';
ZCS.constant.CLASS_FOR_TYPE[ZCS.constant.ITEM_CONTACT]         = 'ZCS.model.contacts.ZtContact';

// Item type for model class
ZCS.constant.TYPE_FOR_CLASS = ZCS.constant.getBackMap(ZCS.constant.CLASS_FOR_TYPE);

// JSON node names for items
ZCS.constant.NODE_CONVERSATION  = 'c';
ZCS.constant.NODE_MESSAGE       = 'm';
ZCS.constant.NODE_CONTACT       = 'cn';

// Order in which to handle notifications
ZCS.constant.NODES = [
	ZCS.constant.NODE_CONVERSATION,
	ZCS.constant.NODE_MESSAGE,
	ZCS.constant.NODE_CONTACT
];

// JSON node name for each item type
ZCS.constant.ITEM_NODE = {};
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CONVERSATION] = ZCS.constant.NODE_CONVERSATION;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_MESSAGE]      = ZCS.constant.NODE_MESSAGE;
ZCS.constant.ITEM_NODE[ZCS.constant.ITEM_CONTACT]      = ZCS.constant.NODE_CONTACT;

// Item type based on JSON node name
ZCS.constant.NODE_ITEM = ZCS.constant.getBackMap(ZCS.constant.ITEM_NODE);

// Controller that handles create for each item type
ZCS.constant.LIST_CONTROLLER = {};
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_CONVERSATION]    = 'ZCS.controller.mail.ZtConvListController';
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_MESSAGE]         = 'ZCS.controller.mail.ZtConvController';
ZCS.constant.LIST_CONTROLLER[ZCS.constant.ITEM_CONTACT]         = 'ZCS.controller.contacts.ZtContactListController';

// Store that holds items for list view
ZCS.constant.STORE = {};
ZCS.constant.STORE[ZCS.constant.APP_MAIL]       = 'ZtConvStore';
ZCS.constant.STORE[ZCS.constant.APP_CONTACTS]   = 'ZtContactStore';

// Organizer types
ZCS.constant.ORG_FOLDER         = 'folder';
ZCS.constant.ORG_MAIL_FOLDER    = 'mailFolder';
ZCS.constant.ORG_ADDRESS_BOOK   = 'addressBook';
ZCS.constant.ORG_SAVED_SEARCH   = 'search';
ZCS.constant.ORG_TAG            = 'tag';

// View (from JSON folder data) that determines which app a folder belongs to
ZCS.constant.FOLDER_VIEW = {};
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_MAIL]     = 'message';
ZCS.constant.FOLDER_VIEW[ZCS.constant.APP_CONTACTS] = 'contact';

// Folder type by app
ZCS.constant.FOLDER_TYPE = {};
ZCS.constant.FOLDER_TYPE[ZCS.constant.APP_MAIL]     = ZCS.constant.ORG_MAIL_FOLDER;
ZCS.constant.FOLDER_TYPE[ZCS.constant.APP_CONTACTS] = ZCS.constant.ORG_ADDRESS_BOOK;

// Organizer names (appear in overview groups)
ZCS.constant.ORG_NAME = {};
ZCS.constant.ORG_NAME[ZCS.constant.ORG_MAIL_FOLDER]   = ZtMsg.folders;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_ADDRESS_BOOK]  = ZtMsg.addressBooks;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_SAVED_SEARCH]  = ZtMsg.searches;
ZCS.constant.ORG_NAME[ZCS.constant.ORG_TAG]           = ZtMsg.tags;

// Organizer nodes (in JSON within a refresh block from the server)
ZCS.constant.ORG_NODE = {};
ZCS.constant.ORG_NODE[ZCS.constant.ORG_FOLDER]        = 'folder';
ZCS.constant.ORG_NODE[ZCS.constant.ORG_SAVED_SEARCH]  = 'search';
ZCS.constant.ORG_NODE[ZCS.constant.ORG_TAG]           = 'tag';

// Order in which organizers should appear grouped in overview
ZCS.constant.ORG_SORT_VALUE = {};
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_MAIL_FOLDER]   = 1;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_ADDRESS_BOOK]  = 1;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_SAVED_SEARCH]  = 2;
ZCS.constant.ORG_SORT_VALUE[ZCS.constant.ORG_TAG]           = 3;

// System folder IDs
ZCS.constant.ID_ROOT      = 1;
ZCS.constant.ID_INBOX     = 2;
ZCS.constant.ID_TRASH     = 3;
ZCS.constant.ID_JUNK      = 4;
ZCS.constant.ID_SENT      = 5;
ZCS.constant.ID_DRAFTS    = 6;
ZCS.constant.ID_CONTACTS  = 7;
ZCS.constant.ID_EMAILED   = 13;
ZCS.constant.ID_CHATS     = 14;

// An ID less than this indicates a system folder
ZCS.constant.MAX_SYSTEM_ID = 255;

// System folder sort order
ZCS.constant.FOLDER_SORT_VALUE = {};

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_TRASH]   = 5;

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_INBOX]   = 1;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_SENT]    = 2;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_DRAFTS]  = 3;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_JUNK]    = 4;

ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_CONTACTS]    = 1;
ZCS.constant.FOLDER_SORT_VALUE[ZCS.constant.ID_EMAILED]     = 2;

// System folder names (used in search queries)
ZCS.constant.FOLDER_SYSTEM_NAME = {};
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_TRASH]   = 'trash';

ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_INBOX]   = 'inbox';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_SENT]    = 'sent';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_DRAFTS]  = 'drafts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_JUNK]    = 'junk';

ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_CONTACTS]    = 'contacts';
ZCS.constant.FOLDER_SYSTEM_NAME[ZCS.constant.ID_EMAILED]     = 'emailedContacts';

ZCS.constant.FOLDER_SYSTEM_ID = ZCS.constant.getBackMap(ZCS.constant.FOLDER_SYSTEM_NAME);

// Folders we don't want to show in overview
ZCS.constant.FOLDER_HIDE = {};
ZCS.constant.FOLDER_HIDE[ZCS.constant.ID_CHATS] = true;

// Email address types
ZCS.constant.TO       = 'TO';
ZCS.constant.FROM     = 'FROM';
ZCS.constant.CC       = 'CC';
ZCS.constant.BCC      = 'BCC';
ZCS.constant.REPLY_TO = 'REPLY_TO';
ZCS.constant.SENDER   = 'SENDER';

// Map SOAP type constants to those above
ZCS.constant.FROM_SOAP_TYPE = {};
ZCS.constant.FROM_SOAP_TYPE['f']  = ZCS.constant.FROM;
ZCS.constant.FROM_SOAP_TYPE['t']  = ZCS.constant.TO;
ZCS.constant.FROM_SOAP_TYPE['c']  = ZCS.constant.CC;
ZCS.constant.FROM_SOAP_TYPE['b']  = ZCS.constant.BCC;
ZCS.constant.FROM_SOAP_TYPE['r']  = ZCS.constant.REPLY_TO;
ZCS.constant.FROM_SOAP_TYPE['s']  = ZCS.constant.SENDER;

// and the other way too
ZCS.constant.TO_SOAP_TYPE = ZCS.constant.getBackMap(ZCS.constant.FROM_SOAP_TYPE);

// Data types
ZCS.constant.TYPE_STRING    = 'string';
ZCS.constant.TYPE_NUMBER    = 'number';
ZCS.constant.TYPE_BOOLEAN   = 'boolean';

// Names of user settings (LDAP attribute names)
ZCS.constant.SETTING_ALIASES            = 'zimbraMailAlias';
ZCS.constant.SETTING_INITIAL_SEARCH     = 'zimbraPrefMailInitialSearch';
ZCS.constant.SETTING_SHOW_SEARCH        = 'zimbraPrefShowSearchString';
ZCS.constant.SETTING_LOCALE             = 'zimbraPrefLocale';
ZCS.constant.SETTING_TIMEZONE           = 'zimbraPrefTimeZoneId';
ZCS.constant.SETTING_MARK_READ          = 'zimbraPrefMarkMsgRead';  // -1 = never, 0 = now, [int] = delay in seconds

// Names of internal settings
ZCS.constant.SETTING_CUR_SEARCH         = 'currentSearch';
ZCS.constant.SETTING_CUR_SEARCH_ID      = 'currentSearchId';

// List of all settings we care about
ZCS.constant.SETTINGS = [

	// LDAP
	ZCS.constant.SETTING_ALIASES,
	ZCS.constant.SETTING_INITIAL_SEARCH,
	ZCS.constant.SETTING_SHOW_SEARCH,
	ZCS.constant.SETTING_LOCALE,
	ZCS.constant.SETTING_TIMEZONE,
	ZCS.constant.SETTING_MARK_READ,

	// internal
	ZCS.constant.SETTING_CUR_SEARCH,
	ZCS.constant.SETTING_CUR_SEARCH_ID
];

// Setting type; defaults to string, so just note exceptions
ZCS.constant.SETTING_TYPE = {};
ZCS.constant.SETTING_TYPE[ZCS.constant.SETTING_SHOW_SEARCH] = ZCS.constant.TYPE_BOOLEAN;

// Forced setting values, which override user setting
ZCS.constant.SETTING_VALUE = {};
ZCS.constant.SETTING_VALUE[ZCS.constant.SETTING_SHOW_SEARCH] = 'false';

// Default values for settings
ZCS.constant.SETTING_DEFAULT = {};
ZCS.constant.SETTING_DEFAULT[ZCS.constant.SETTING_LOCALE] = 'en_US';

// Item flags
ZCS.constant.FLAG_ATTACH			= 'a';
ZCS.constant.FLAG_FLAGGED			= 'f';
ZCS.constant.FLAG_FORWARDED			= 'w';
ZCS.constant.FLAG_ISDRAFT 			= 'd';
ZCS.constant.FLAG_ISSENT			= 's';
ZCS.constant.FLAG_REPLIED			= 'r';
ZCS.constant.FLAG_UNREAD			= 'u';

ZCS.constant.ALL_FLAGS = [
	ZCS.constant.FLAG_FLAGGED,
	ZCS.constant.FLAG_ATTACH,
	ZCS.constant.FLAG_UNREAD,
	ZCS.constant.FLAG_REPLIED,
	ZCS.constant.FLAG_FORWARDED,
	ZCS.constant.FLAG_ISSENT,
	ZCS.constant.FLAG_ISDRAFT
];

// Map flag to item property
ZCS.constant.FLAG_PROP = {};
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ATTACH]			= 'hasAttach';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_FLAGGED]			= 'isFlagged';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_FORWARDED]			= 'isForwarded';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ISDRAFT] 			= 'isDraft';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_ISSENT]			= 'isSent';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_REPLIED]			= 'isReplied';
ZCS.constant.FLAG_PROP[ZCS.constant.FLAG_UNREAD]			= 'isUnread';

//ZCS.constant.PROP_FLAG = ZCS.constant.getBackMap(ZCS.constant.FLAG_PROP);

// Date/time constants
ZCS.constant.MSEC_PER_MINUTE = 60000;
ZCS.constant.MSEC_PER_HOUR = 60 * ZCS.constant.MSEC_PER_MINUTE;
ZCS.constant.MSEC_PER_DAY = 24 * ZCS.constant.MSEC_PER_HOUR;

// How many senders to show for a conv in the conv list
ZCS.constant.NUM_CONV_SENDERS = 3;

// Extra mail headers to fetch for a SOAP request
ZCS.constant.ADDITIONAL_MAIL_HEADERS = [
	{ n: 'List-ID' },
	{ n: 'X-Zimbra-DL' },
	{ n: 'IN-REPLY-TO' }
];

// Useful regexes
ZCS.constant.REGEX_NON_WHITESPACE = /\S+/;
ZCS.constant.REGEX_SPLIT = /\r\n|\r|\n/;
ZCS.constant.REGEX_SUBJ_PREFIX = new RegExp('^\\s*(Re|Fw|Fwd|' + ZtMsg.re + '|' + ZtMsg.fwd + '|' + ZtMsg.fw + '):' + '\\s*', 'i');
