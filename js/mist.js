$(function() {

	var accessToken = "";

	var crypto = require('crypto');

	function newAccessToken(len) {
		return crypto.randomBytes(Math.ceil(16))
			.toString('hex'); // convert to hexadecimal format
	}

	$("#startGethBtn").click(function() {

		var exec = require('child_process').exec;
		environ = {};
		for (v in process.env) {
			environ[v] = process.env[v];
		}
		
		accessToken = newAccessToken();
		environ["accessToken"] = accessToken;

		exec('geth --rpcport 8686 --port=31313 --datadir $HOME/tmp/ethereum1 mist 2> /dev/pts/4', {env: environ});
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
