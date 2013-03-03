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
 * This class manages the composition of email messages, including new messages,
 * replies, and forwards.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.controller.mail.ZtComposeController', {

	extend: 'Ext.app.Controller',

	requires: [
		'ZCS.view.mail.ZtComposeForm',
		'ZCS.common.ZtUtil'
	],

	config: {

		refs: {
			// event handlers
			composePanel: 'composepanel',
			contactField: 'composepanel contactfield',

			// other
			mailView: '#' + ZCS.constant.APP_MAIL + 'view',
			composeForm: 'composepanel formpanel'
		},

		control: {
			composePanel: {
				cancel: 'doCancel',
				send: 'doSend'
			},
			contactField: {
				bubbleHold: 'showBubbleMenu'
			}
		},

		models: [
			'ZCS.model.address.ZtAutoComplete'
		],

		stores: [
			'ZCS.store.address.ZtAutoCompleteStore'
		],

		action: null,
		origId: null
	},

	showBubbleMenu: function (field, bubble, bubbleModel) {
		var menu = Ext.create('ZCS.common.ZtMenu', {
			referenceComponent: bubble,
			modal: true
		});

		menu.setMenuItems(Ext.create('ZCS.model.ZtMenuItem', {
			label: 'Remove',
			listener: function () {
				field.removeBubble(bubble);
			}
		}));

		menu.popup();
	},

	compose: function() {
		this.setAction(ZCS.constant.OP_COMPOSE);
		this.showComposeForm();
	},

	reply: function(msg) {

		var action = ZCS.constant.OP_REPLY;

		this.setAction(action);
		this.setOrigId(msg.getId());

		var to = [msg.getReplyAddress()],
			cc,
			subject = this.getSubject(msg, 'Re:'),
			body = this.quoteOrigMsg(msg, action);

		this.showComposeForm(to, cc, subject, body);
	},

	replyAll: function(msg) {

		var action = ZCS.constant.OP_REPLY_ALL;

		this.setAction(action);
		this.setOrigId(msg.getId());

		var userEmail = ZCS.session.getAccountName(),
			replyAddr = msg.getReplyAddress(),
			origToAddrs = msg.getAddressesByType(ZCS.constant.TO),
			origCcAddrs = msg.getAddressesByType(ZCS.constant.CC),
			ccAddrs = [],
			used = {},
			subject = this.getSubject(msg, 'Re:'),
			body = this.quoteOrigMsg(msg, action);

		// Remember emails we don't want to repeat in Cc
		// TODO: add aliases to used hash
		used[userEmail] = true;
		used[replyAddr.get('email')] = true;

		Ext.each(origToAddrs.concat(origCcAddrs), function(addr) {
			if (!used[addr.get('email')]) {
				ccAddrs.push(addr);
			}
		}, this);

		this.showComposeForm([replyAddr], ccAddrs, subject, body);
	},

	forward: function(msg) {

		var action = ZCS.constant.OP_FORWARD;

		this.setAction(action);
		this.setOrigId(msg.getId());

		var	subject = this.getSubject(msg, 'Fwd:'),
			body = this.quoteOrigMsg(msg, action);

		this.showComposeForm(null, null, subject, body);
	},

	/**
	 * Show the compose form, prepopulating any parameterized fields
	 */
	showComposeForm: function (toFieldAddresses, ccFieldAddresses, subject, body) {

		var panel = this.getComposePanel(),
			form = panel.down('formpanel'),
			toFld = form.down('contactfield[name=to]'),
			ccFld = form.down('contactfield[name=cc]'),
			subjectFld = form.down('field[name=subject]'),
			bodyFld = form.down('#body'),
			editor = bodyFld.element.query('.zcs-editable')[0];

		panel.resetForm();

		if (ccFieldAddresses) {
			panel.showCc();
		}

		panel.show({
			type: 'slide',
			direction: 'up'
		});

		if (toFieldAddresses) {
			toFld.addBubbles(toFieldAddresses);
		}

		if (ccFieldAddresses) {
			ccFld.addBubbles(ccFieldAddresses);
		}

		if (subject) {
			subjectFld.setValue(subject);
		}

		editor.innerHTML = body || '';

		if (!toFieldAddresses) {
			toFld.focusInput();
		} else if (!subject) {
			subjectFld.focus();
		} else {
			editor.focus();
			editor.scrollTop = 0
		}

		ZCS.htmlutil.resetWindowScroll();
	},

	/**
	 * @private
	 */
	getSubject: function(msg, prefix) {
		var subject = msg.get('subject'),
			pre = (subject.indexOf(prefix) === 0) ? '' : prefix + ' ';

		return pre + subject;
	},

	/**
	 * @private
	 */
	doCancel: function() {
		this.getComposePanel().hide();
	},

	/**
	 * @private
	 */
	doSend: function() {

		var	values = this.getComposeForm().getValues(),
			editor = this.getComposePanel().down('#body').element.query('.zcs-editable')[0];

		Ext.Logger.info('Send message');
		var msg = Ext.create('ZCS.model.mail.ZtMailMsg', {
			from: ZCS.session.getAccountName(),
			to: values.to,
			cc: values.cc,
			bcc: values.bcc,
			subject: values.subject
		});
		msg.setComposeAction(this.getAction());
		msg.setOrigId(this.getOrigId());
		msg.createMime(editor.innerHTML, this.getAction() !== ZCS.constant.OP_COMPOSE);
		msg.save();
		this.getComposePanel().hide();
	},

	/**
	 * @private
	 */
	getComposePanel: function() {
		if (!this.composePanel) {
			this.composePanel = Ext.create('ZCS.view.mail.ZtComposeForm');
			Ext.Viewport.add(this.composePanel);
		}

		return this.composePanel;
	},

	quoteHtml: function(html) {
		return ZCS.constant.HTML_QUOTE_PREFIX_PRE + html + ZCS.constant.HTML_QUOTE_PREFIX_POST;
	},

	quoteOrigMsg: function(msg, action) {

		var isForward = (action === ZCS.constant.OP_FORWARD),
			which = isForward ? 'FORWARD' : 'REPLY',
			incWhat = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_WHAT']),
			usePrefix = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_USE_PREFIX']),
			incHeaders = ZCS.session.getSetting(ZCS.constant['SETTING_' + which + '_INCLUDE_HEADERS']);

		if (incWhat === ZCS.constant.INC_NONE) {
			return '';
		}

		if (incWhat === ZCS.constant.INC_ATTACH) {
			return '';
		}

		var headerText = '',
			headers = [],
			hdrList = ZCS.constant.QUOTED_HDRS,
			sep = '<br><br>',
			ln = hdrList.length, i, hdr;

		if (incHeaders) {
			for (i = 0; i < ln; i++) {
				hdr = msg.getHeaderStr(hdrList[i]);
				if (hdr) {
					headers.push(hdr);
				}
			}
			headerText += headers.join('<br>') + sep;
		}

		var content = msg.getContentForInclusion(),
			isHtml = msg.hasHtmlPart();

		if (incWhat === ZCS.constant.INC_SMART) {
			content = ZCS.quoted.getOriginalContent(content, isHtml);
		}

		content = headerText + content;
		var	quoted = usePrefix ? this.quoteHtml(content) : content,
			divider = isForward ? ZtMsg.forwardedMessage : ZtMsg.originalMessage;

		return sep + '----- ' + divider + ' -----' + sep + quoted;
	}
});
