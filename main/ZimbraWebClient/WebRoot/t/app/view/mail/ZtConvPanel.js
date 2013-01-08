Ext.define('ZCS.view.mail.ZtConvPanel', {

	extend: 'ZCS.view.ZtItemPanel',

	requires: [
		'ZCS.view.mail.ZtMsgListView'
	],

	xtype: 'convpanel',

	getItemView: function() {
		return {
			xtype: 'msglistview',
			store: Ext.getStore('ZtMsgStore')
		};
	}
});
