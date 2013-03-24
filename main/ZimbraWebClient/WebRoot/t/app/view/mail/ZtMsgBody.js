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
 * This class displays the content of a mail message.
 *
 * @author Conrad Damon <cdamon@zimbra.com>
 */
Ext.define('ZCS.view.mail.ZtMsgBody', {

	extend: 'Ext.Container',

	requires: [
		'ZCS.common.mail.ZtQuotedContent',
		'ZCS.view.ux.ZtIframe'
	],

	xtype: 'msgbody',

	config: {
		cls:            'zcs-msg-body',

		msg:            null,       // msg being displayed
		usingIframe:    false       // true if msg content is within an IFRAME
	},

	statics: {
		externalImagesShown:    {},     // lookup hash of IDs of msgs whose external images user has loaded
		numImgsToLoad:          0,      // number of images whose 'src' has been set so they load
		numImgsLoaded:          0,      // number of images whose 'onload' handlers have fired

		/**
		 * Resizes the IFRAME after all of the fixed images have loaded. The alternative is to resize
		 * the IFRAME after each image loads, but that could be a lot of resizing. This approach should
		 * be much more efficient, with the risk that a single slow-loading or failing image could
		 * prevent the resize.
		 *
		 * Only IMG elements are handled this way. For background images, we set a timer to do the
		 * resize, since there is no 'onload' event fired when a background image has loaded. (One way
		 * to get around that is by 'image preloading', but I don't think it's worth it.)
		 *
		 * @param {ZtMsgBody}   me      the msg body object
		 * @param {Element}     img     the IMG whose onload handler was invoked
		 *
		 * @private
		 */
		imgOnloadHandler: function(me, img) {

			ZCS.view.mail.ZtMsgBody.numImgsLoaded += 1;
			var toLoad = ZCS.view.mail.ZtMsgBody.numImgsToLoad,
				loaded = ZCS.view.mail.ZtMsgBody.numImgsLoaded;

			Ext.Logger.image('Img onload handler: ' + loaded + ' / ' + toLoad);
			if (toLoad > 0 && loaded === toLoad) {
				Ext.Logger.image('Img onload handler: resize iframe');
				me.iframe.resizeToContent();
			}
			img.onload = null;
		}
	},

	/**
	 * Renders the given msg.
	 *
	 * @param {ZtMailMsg}   msg             a mail message
	 * @param {Boolean}     showQuotedText  (optional) if passed, show or hide quoted text
	 *
	 * @adapts ZmMailMsgView._renderMessageBody1
	 */
	render: function(msg, showQuotedText) {

		Ext.Logger.conv('ZtMsgBody render into element ' + this.element.id);

		// if this is the last msg in the conv to be rendered, we don't hide quoted text
		var store = this.up('mailitemview').getStore(),
			count = store.getCount(),
			msgIndex = store.indexOf(msg),
			isLast = (msgIndex === count - 1);

		var me = this,
			isInvite = msg.get('isInvite'),
			togglingQuotedText = Ext.isBoolean(showQuotedText),
			trimQuotedText = togglingQuotedText ? !showQuotedText : !isLast && !isInvite,
			msgId = msg.getId(),
			html = msg.getContentAsHtml(this.getId(), trimQuotedText),
			hasQuotedContent = ZCS.model.mail.ZtMailMsg.hasQuotedContent[msgId],
			isHtml = msg.hasHtmlPart(),
			container = this.htmlContainer,
			iframeWidth = this.element.getWidth() || (this.parent.getChildWidth() - 22),
			iframe = this.iframe;

		this.setMsg(msg);
		this.setUsingIframe(isHtml && !isInvite);

		this.resetExtraComponents();

		this.showingQuotedText = !trimQuotedText;

		html = ZCS.htmlutil.trimAndWrapContent(html);

		if (this.getUsingIframe()) {
			Ext.Logger.conv('Use IFRAME for [' + msg.get('fragment') + ']');
			if (container) {
				container.setHtml('');
				container.hide();
			}
			if (!iframe) {
				iframe = this.iframe = new ZCS.view.ux.ZtIframe({
					name: 'ZCSIframe-' + this.up('msgview').getId(),
					css: ZCS.session.msgBodyCss,
					width: iframeWidth
				});

				iframe.on('msgContentResize', function () {
					me.fireEvent('msgContentResize');
				}, this);

				this.add(iframe);
			} else {
				//We might have to get the width from the parent if this hasn't been shown yet (only msg header has been shown)
				iframe.setWidth(iframeWidth);
			}

			iframe.setContent(html);

			// We hide external images if user wants us to, or this is Spam, and the user hasn't
			// already pressed the button to display them.
			var parsedId = ZCS.util.parseId(msg.get('folderId')),
				isSpam = (parsedId && parsedId.localId === ZCS.constant.ID_JUNK),
				isTrusted = msg.hasTrustedSender(),
				imagesShown = ZCS.view.mail.ZtMsgBody.externalImagesShown[msgId],
				showExternalImages = ZCS.session.getSetting(ZCS.constant.SETTING_DISPLAY_IMAGES),
				hideExternalImages = (!showExternalImages || isSpam) && !isTrusted && !imagesShown;

			this.hiddenImages = this.fixImages(msg, iframe.getBody(), hideExternalImages);

			iframe.show();
		}
		else {
			Ext.Logger.conv('No IFRAME for [' + msg.get('fragment') + ']');
			if (iframe) {
				iframe.hide();
			}
			if (!container) {
				container = this.htmlContainer = Ext.create('Ext.Component', {
					cls: 'zcs-html-container'
				});
				this.add(this.htmlContainer);
			}

			container.removeCls('zcs-msg-body-text');
			if (!isHtml) {
				container.addCls('zcs-msg-body-text');
			}

			container.setHtml(html);
			container.show();
		}

		var attInfo = msg.getAttachmentInfo();

		this.setExtraComponents({
			attachments:    attInfo.length > 0 ? attInfo : null,
			images:         this.hiddenImages && this.hiddenImages.length > 0,
			truncated:      msg.isTruncated(),
			quoted:         !hasQuotedContent ? null : (trimQuotedText || togglingQuotedText) && trimQuotedText ? 'show' : 'hide'
		});
	},

	/**
	 * Destroys any extra components that were created.
	 * @private
	 */
	resetExtraComponents: function() {

		if (this.attachmentsArea) {
			this.attachmentsArea.destroy();
		}

		this.hiddenImages = null;
		if (this.infoBar) {
			this.infoBar.destroy();
		}

		// Create DIV to show truncated message if needed
		if (this.truncatedComponent) {
			this.truncatedComponent.destroy();
		}

		if (this.quotedTextComponent) {
			this.quotedTextComponent.destroy();
		}
	},

	/**
	 * Adds any needed extra components. Attachments, the external images info bar, and a warning
	 * about message truncation come before the message body in that order. A link to show/hide quoted
	 * text is added after the body if needed.
	 *
	 * @private
	 */
	setExtraComponents: function(params) {

		var prepend = [];

		// Show attachments
		if (params.attachments) {
			this.createAttachmentsArea(params.attachments);
			prepend.push(this.attachmentsArea);
		}

		// Tell user that external images have not yet been loaded
		if (params.images) {
			this.createInfoBar();
			prepend.push(this.infoBar);
		}

		// Tell user they aren't seeing the whole long message
		if (params.truncated) {
			this.truncatedComponent = new Ext.Component({
				html: ZCS.view.mail.ZtMsgBody.truncatedTpl.apply({})
			});
			prepend.push(this.truncatedComponent);
		}

		if (prepend.length > 0) {
			Ext.each(prepend.reverse(), function(comp) {
				this.insert(0, comp);
			}, this);
		}

		// Let user show/hide quoted text
		if (params.quoted) {
			this.quotedTextComponent = new Ext.Component({
				html: ZCS.view.mail.ZtMsgBody.quotedLinkTpl.apply({ show: params.quoted === 'show' })
			});
			this.add(this.quotedTextComponent);
		}
	},

	/**
	 * Goes through the message DOM looking for images to fix, including those that are used
	 * as background images (usually in BODY or TD). Internal images will get their URLs set
	 * to grab a part from the server. External images will be hidden or shown based on a user
	 * setting.
	 *
	 * @param {ZtMailMsg}       msg                     msg being displayed
	 * @param {Element}         containerEl             top-level element of DOM
	 * @param {boolean}         hideExternalImages      if true, hide external images
	 *
	 * @return {Array}    list of hidden images
	 */
	fixImages: function(msg, containerEl, hideExternalImages) {

		if (!containerEl) {
			return [];
		}

		var	els = containerEl.getElementsByTagName('*'),
			ln = els.length,
			html = containerEl.innerHTML,
			checkBackground = (html.indexOf('dfbackground') !== -1) ||
			                  (html.indexOf('pnbackground') !== -1),
			hiddenImages = [],
			onloadHandler,
			fixedBackground = false;

		if (this.getUsingIframe()) {
			ZCS.view.mail.ZtMsgBody.numImgsToLoad = 0;
			ZCS.view.mail.ZtMsgBody.numImgsLoaded = 0;
			onloadHandler = ZCS.view.mail.ZtMsgBody.imgOnloadHandler;
		}

		for (var i = 0; i < ln; i++) {

			var el = els[i],
				nodeName = el.nodeName.toLowerCase(),
				isImg = (nodeName === 'img');

			if ((isImg && this.fixImage(msg, el, 'src', hideExternalImages, onloadHandler)) ||
				(checkBackground && this.fixImage(msg, el, 'background', hideExternalImages))) {

				hiddenImages.push(el);
				if (!isImg) {
					fixedBackground = true;
				}
			}
		}

		if (fixedBackground) {
			Ext.Logger.image('Background handled, resize on timer');
			Ext.defer(this.iframe.resizeToContent, 500, this.iframe);
		}

		return hiddenImages;
	},

	/**
	 * Rewrites the src reference for internal images so that they display, and optionally
	 * does the same for external images. Internal images will have 'cid', 'doc', and 'pnsrc'
	 * converted to a URL with a part value that can be used to fetch the image from our
	 * server. The part value is taken from the message's MIME parts.
	 *
	 * @param {ZmMailMsg}	msg			        mail message
	 * @param {Element}		el		            element to be checked (img)
	 * @param {string}		attr		        attribute name
	 * @param {boolean}     hideExternalImages  if true, replace external image with placeholder
	 *
	 * @return	true if the image is external and was replaced
	 */
	fixImage: function(msg, el, attr, hideExternalImages, onloadHandler) {

		var dfAttr = 'df' + attr,
			pnAttr = 'pn' + attr,
			baseValue, dfValue, pnValue, value,
			imgChanged = false,
			me = this;

		try {
			baseValue = el.getAttribute(attr);
			dfValue = el.getAttribute(dfAttr);
			pnValue = el.getAttribute(pnAttr);
		}
		catch(e) {
			Ext.Logger.warn('ZtMsgBody.restoreImages: exception accessing base attribute ' + attr + ' in ' + el.nodeName);
		}

		value = baseValue || dfValue || pnValue;

		if (value) {
			if (value.indexOf('cid:') === 0) {
				// image came as a related part keyed by Content-ID
				var cid = '<' + decodeURIComponent(value.substr(4)) + '>';
				value = msg.getPartUrlByField('contentId', cid, 'foundInMsgBody');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (value.indexOf('doc:') === 0) {
				// image is in Briefcase
				value = [ZCS.session.getSetting(ZCS.constant.SETTING_REST_URL), '/', value.substring(4)].join('');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (pnValue) {
				// image came as a related part keyed by Content-Location
				value = msg.getPartUrlByField('contentLocation', value, 'foundInMsgBody');
				if (value) {
					el.setAttribute(attr, value);
					imgChanged = true;
				}
			}
			else if (dfValue) {
				if (hideExternalImages) {
					if (attr === 'src') {
						el.src = '/img/zimbra/1x1-trans.png';
					}
					return true;
				}
				else {
					el.src = dfValue;
					imgChanged = true;
				}
			}
			else if (value.indexOf('data:') === 0) {
			}
		}

		if (imgChanged && onloadHandler) {
			el.onload = onloadHandler.bind(null, me, el);
			ZCS.view.mail.ZtMsgBody.numImgsToLoad += 1;
		}

		return false;
	},

	/**
	 * Creates a section below the msg header that allows the user to press a button to load
	 * external images.
	 *
	 * @param {int}     index       index at which to insert component if creating it
	 * @private
	 */
	createInfoBar: function() {

		this.infoBar = Ext.create('Ext.Container', {
			layout: {
				type: 'hbox',
				align: 'center',
				pack: 'center'
			},
			cls: 'zcs-info-bar',
			items: [
				{
					flex: 2,
					html: ZtMsg.imagesNotLoaded
				},
				{
					xtype: 'button',
					flex: 1,
					text: ZtMsg.loadImages,
					handler: function() {
						Ext.Logger.info('load images');
						if (!this.up('msgview').readOnly) {
							this.up('msgbody').showExternalImages();
						}
					}
				}
			]
		});
	},

	/**
	 * Shows external images (including background images) by changing the "defanged" attribute
	 * into the real one.
	 *
	 * @private
	 */
	showExternalImages: function() {

		var onloadHandler = ZCS.view.mail.ZtMsgBody.imgOnloadHandler,
			fixedBackground = false,
			me = this;

		ZCS.view.mail.ZtMsgBody.numImgsToLoad = 0;
		ZCS.view.mail.ZtMsgBody.numImgsLoaded = 0;

		Ext.each(this.hiddenImages, function(el) {
			var isImg = (el.nodeName.toLowerCase() === 'img'),
				attr = isImg ? 'src' : 'background';

			el.setAttribute(attr, el.getAttribute('df' + attr));
			if (isImg) {
				ZCS.view.mail.ZtMsgBody.numImgsToLoad += 1;
				el.onload = onloadHandler.bind(null, me, el);
			}
			else {
				fixedBackground = true;
			}
		}, this);

		if (fixedBackground) {
			Ext.Logger.image('External background loaded, resize on timer');
			Ext.defer(this.iframe.resizeToContent, 500, this.iframe);
		}

		var msgId = this.getMsg().getId();
		ZCS.view.mail.ZtMsgBody.externalImagesShown[msgId] = true;
		this.infoBar.hide();
	},

	/**
	 * Creates a section below the msg header with a bubble for each attachment.
	 *
	 * @private
	 */
	createAttachmentsArea: function(attachments) {

		var	area = this.attachmentsArea = Ext.create('Ext.Component', {
			cls: 'zcs-attachments'
		});

		var html = [],
			idx = 0,
			ln = attachments.length, i;

		for (i = 0; i < ln; i++) {
			var attInfo = attachments[i],
				id = ZCS.util.getUniqueId({
					type:   ZCS.constant.IDTYPE_ATTACHMENT,
					url:    attInfo.url
				});

			attInfo.id = id;
			html[idx++] = ZCS.view.mail.ZtMsgBody.attachmentTpl.apply(attInfo);
		}
		area.setHtml(html.join(''));
	}
},
	function (thisClass) {
		thisClass.attachmentTpl = Ext.create('Ext.XTemplate', ZCS.template.Attachment);
		thisClass.quotedLinkTpl = Ext.create('Ext.XTemplate', ZCS.template.QuotedLink);
		thisClass.truncatedTpl = Ext.create('Ext.XTemplate', ZCS.template.Truncated);
	}
);
