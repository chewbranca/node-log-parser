#!/usr/local/bin/node

/*
 * Settings 
 */
var config = require('./config').config;

var sys = require('sys'), couchdb = require('./lib/node-couchdb-min/couchdb'), parser = require('./log-parser');
var logsDB = new couchdb.Db(config.couch_db_name);
var debug = false;
if (debug) parser.setDebug(debug);

var couchdb_save_func = function(logs) {
	if (debug)
		sys.puts("Processing "+logs.length+" logs");

	logsDB.get('/_uuids?count='+logs.length, function(err, result) {
		if (err) return sys.error(err.stack);
		var uuids = result.uuids;

		for (var i = 0, l = logs.length; i < l; i++) {
			var uuid = uuids[i];
			var log = logs[i];

			logsDB.put(uuid, log, function(err, result) {
				if (err) return sys.error(err.stack);
				if (debug)
					sys.log('Created doc at '+uuid+' with --> '+sys.inspect(result));
			});
		}
	});
};

parser.process_logs(config.file, parser.railsLogParser, couchdb_save_func);
