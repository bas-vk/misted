$(function() {

	var accessToken = "";
	var gethLog = [];
	var maxGethLog = 10;

	var crypto = require('crypto');

	function newAccessToken(len) {
		return crypto.randomBytes(Math.ceil(16)).toString('hex'); // convert to hexadecimal format
	}

	function updateGethLog(line) {
		gethLog.push(line);
		if (gethLog.length > maxGethLog) {
				gethLog.shift();
		}

		var logs = ""
		gethLog.reverse().forEach(function(log) {
			logs += log + "<br />";
		})

		$("#gethlog").html(logs);
	}

	$("#startGethBtn").click(function() {
		var spawn = require('child_process').spawn;
		environ = {};
		for (v in process.env) {
			environ[v] = process.env[v];
		}
		
		accessToken = newAccessToken();
		environ["accessToken"] = accessToken;

		geth = spawn("geth", ["--rpcport=8686", "--port=31313", "--datadir=$HOME/tmp/ethereum1", "mist"], {env: environ});

		geth.stderr.on("data", function(line) {
			updateGethLog(line);
		});

		geth.stdin.on("data", function(line) {
			updateGethLog(line);
		});
	});

	$("#stopGethBtn").click(function() {
		var WebSocket = require("ws");
		var geth = new WebSocket("ws://localhost:8546/geth?accessToken=" + accessToken);

		geth.on("open", function() {
			geth.send('{"jsonrpc":"0.0.1","method":"quit","params":[],"id":1}');
		});

		geth.on("message", function(message) {
			console.log("message recv: ", message)
			geth.close();
		});
	});

	$("#startMinerBtn").click(function() {
		var WebSocket = require("ws");
		var geth = new WebSocket("ws://localhost:8546/geth?accessToken=" + accessToken);

		geth.on("open", function() {
			geth.send('{"jsonrpc":"0.0.1","method":"miner_start","params":[],"id":1}');
		});

		geth.on("message", function(message) {
			console.log("message recv: ", message)
			geth.close();
		});
	});

	$("#stopMinerBtn").click(function() {
		var WebSocket = require("ws");
		var geth = new WebSocket("ws://localhost:8546/geth?accessToken=" + accessToken);

		geth.on("open", function() {
			geth.send('{"jsonrpc":"0.0.1","method":"miner_stop","params":[],"id":1}');
		});

		geth.on("message", function(message) {
			console.log("message recv: ", message)
			geth.close();
		});
	});


	
});
