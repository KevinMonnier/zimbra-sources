Ext.define('ZCS.model.mail.ZtMsgReader', {
	extend: 'Ext.data.reader.Json',
	alias: 'reader.msgreader',

	/**
	 * Override this method since there's no easy way to override the generated methods that return the
	 * total, success, and message properties.
	 *
	 * @param data
	 */
	readRecords: function(data) {

		var me  = this;
		me.rawData = data;

		var root = (data.Body.SearchConvResponse && data.Body.SearchConvResponse.m) ||
				   (data.Body.SendMsgResponse && data.Body.SendMsgResponse.m),
			total = root.length,
			success = true,
			message,
			recordCount = 0,
			records = [],
			i, j, len, node, data, participant;

		if (root && total) {
//			records = me.extractData(data);
			for (i = 0; i < total; i++) {
				node = root[i];
				data = {};
//				data.fragment = node.fr;
				data.content = (node.mp && node.mp[0] && node.mp[0].content) || node.fr;
				data.convId = node.cid;

				// converted to ZtEmailAddress objects and added to conv in ZtConvStore 'load' listener
				data.rawAddresses = node.e;

				records.push({
					clientId: null,
					id: node.id,
					data: data,
					node: node
				});
			}
			recordCount = total;
		}

		return new Ext.data.ResultSet({
			total  : total,
			count  : recordCount,
			records: records,
			success: success,
			message: message
		});
	}
});
