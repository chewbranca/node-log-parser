Node Log Parser
===============

Node Log Parser is a Node.js module to parse logs of various formats. Right now
it has support for Rails production logs, but I will soon be adding support for
other formats, such as Couch DB, nginx, Redis, and anything else that comes up.

It is primarily geared towards taking log files and converting them into JSON
format to pass along to Couch DB for storage and processing. However, it is
modular so other database storage options are welcome.

Why a Javascript log parser?
--------

A few reasons:
1. I wanted to expirment more with Node.js and Couch DB, I also have plenty of
log data to work with to make things interesting.
2. I am not satisifed with current log parsing systems so I decided to roll my
own. This is the processing piece of the puzzle, I will be building a UI on top
of this as a separate component to keep the functionality isolated.
3. Machine readable log formats are incredibly cool, especially when its JSON
and you can throw that data into Couch DB to run map/reduce on. Unfortunately,
I have tons of log files that are not stored as JSON, hence the creation of this
project.

Installation
------------

Install by cloning this repo, initializing submodules, and then including this
library in your Node.js program.

	$ git clone git://github.com/chewbranca/node-log-parser.git
	$ git submodule init
	$ git submodule update

The submodule dependency is
[rsms/node-couchdb-min](http://github.com/rsms/node-couchdb-min). I have not
modified this fork yet, however I expect to shortly as this project progresses.

Example Storing to Couch DB
---------------------------
	var couchdb = require('./couchdb'), parser = require('./log-parser');
	var cdb = new couchdb.Db('logs');

	parser.process_logs('/home/chewbranca/src/rails_app/log/production.log',
		parser.railsLogParser,
		function(logs) {
			for (var i = 0, l = logs.length; i < l; i++) {
				var log = logs[i];
				cdb.put(uuid, log, function(err, result) {
				});
			}
		}
	});

A working example can be found in couchdb-sample.js. Edit the two Settings at
the top, and then from the command line run ./couchdb-sample.js.

Example Couch DB map/reduce
---------------------------

Now that you've got your data into Couch DB, its time to have some fun.
Here is a quick example calculating the average elapsed time for each page.

**Map**

	function(doc) {
		if (doc.success) {
			emit([doc.processing.controller, doc.processing.action],
				  doc.success.elapsed_time);
		}
	}

**Reduce**

	function(keys, values) {
		var sum = 0;
		values.forEach(function(value) {
			sum += parseInt(value);
		});
		var avg = sum / values.length;
		return avg + "ms";
	}


Status
------

This is an initial release and has a lot of rough edges, but it gets some rails
log data from your log files into Couch DB to play around with. A couple issues
to be aware of.

* This currently loads the entire log file into memory to process, so it is not
yet recommended for large log files.
* Rails log files are far from consistent, as such, this works with a subset of
rails log messages. This will increase over time as more log messages are
parsed and I extend the rails parser for the various formats.




Conventions
-----------

Right now there are only two real conventions to keep in mind if you add a new
parser.

1. All log messages should either have a success or error property set.
2. Set the base date property to be the result of `exports.dataToArray`. This
is so we can do some fun sorting on the date fields with Couch DB.

Todo/Misc Thoughts
------------------

* Switched to buffered line reader
* Add more log parsers
* Expand Rails parsers
* Add more Couch DB views
* Command line options parsing
* Lots more

* The rails log format is a mess, which is why I'm using regex, however, for
more reasonable single log standardized log messages, I will most likely
inline sed & awk scripts to parse though so we can expedite getting data in.


Links
-----

* [node-log-parser](http://github.com/chewbranca/node-log-parser)
