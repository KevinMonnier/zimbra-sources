/**
 * This class represents a compose form that can be used to compose, reply to, or forward a message. It has a toolbar
 * on top and the actual form below. The form has fields for entering addresses, a subject, and the body of the
 * message. The toolbar has button to cancel or send the message.
 */
Ext.define('ZCS.view.mail.ZtComposeForm', {

	extend: 'Ext.Sheet',

	requires: [
		'Ext.form.Panel',
		'Ext.field.Email',
		'Ext.field.Text',
		'Ext.field.TextArea'
	],

	xtype: 'composepanel',

	config: {
		layout: 'fit',
		width: '80%',
		height: '90%',
		hidden: true,
		modal: true
	},

	initialize: function() {

		var toolbar = {
			xtype: 'titlebar',
			docked: 'top',
			title: 'Compose',
			items: [
				{
					xtype: 'button',
					text: 'Cancel',
					handler: function() {
						this.up('composepanel').fireEvent('cancel');
					}
				},
				{
					xtype: 'button',
					text: 'Send',
					align: 'right',
					handler: function() {
						this.up('composepanel').fireEvent('send');
					}
				}
			]
		};

		var form = {
			xtype: 'formpanel',
			defaults: {
				labelWidth: '100px',
				inputCls: 'zcs-form-input'
			},
			items: [
				{
					xtype: 'emailfield',
					name: 'to',
					label: 'To:'
				},
				{
					xtype: 'emailfield',
					name: 'cc',
					label: 'Cc:'
				},
				{
					xtype: 'textfield',
					name: 'subject',
					label: 'Subject:'
				},
				{
					xtype: 'textareafield',
					name: 'body',
					maxRows: 16     // TODO: would be nicer to auto-size to remaining height
				}
			]
		};

		this.add([
			toolbar,
			form
		]);
	}
});
