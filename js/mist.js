var gui = require('nw.gui');

$(function() {

	var accessToken = "";
	var accessTokenLength = 16;
	var gethLog = [];
	var maxGethLog = 10;
	var eventLog = [];
	var maxEventLog = 5;
	var gethWebSocket = null;
	// number of retries to connect to geth before giving up
	var maxRetries = 3;

	var crypto = require('crypto');

	function newAccessToken(len) {
		return crypto.randomBytes(Math.ceil(accessTokenLength)).toString('hex'); // convert to hexadecimal format
	}

	function handleEvent(event) {
		eventLog.unshift(event);
		if (eventLog.length > maxEventLog) {
			eventLog.pop();
		}

		var events = "<ul>";
		eventLog.forEach(function(ev) {
			events += "<li>" + JSON.stringify(ev) + "</li>";
		});
		events += "</ul>";

		$("#eventlog").html(events);
	}

	function handleHashrate(reply) {
		$("#hashrate").val(reply.result.hashrate);
	}

	function handleMessage(message) {
		var response = JSON.parse(message);
		if (response.method == "event") {
			handleEvent(response);
		} else if (response.method == "miner_hashrate") {
			handleHashrate(response);
		} else {
			console.log("unhandled message: " + JSON.stringify(response))
		}
	}

	function updateGethLog(line) {
		gethLog.unshift(line);
		if (gethLog.length > maxGethLog) {
				gethLog.pop();
		}

		var logs = "<ul>"
		gethLog.forEach(function(log) {
			logs += "<li>" + log + "</li>";
		})
		logs += "</ul>"

		$("#gethlog").html(logs);
	}

	function openGethWebSocket() {
		if (maxRetries == 0) {
			return;
		}

		var WebSocket = require("ws");
		gethWebSocket = new WebSocket("ws://localhost:8546/geth?accessToken=" + accessToken);

		gethWebSocket.on("message", function(message) {
			handleMessage(message);
		});

		gethWebSocket.on("close", function() {
			$("#wsstatus").html("disconnected");
			maxRetries -= 1;
			openGethWebSocket();
		});

		gethWebSocket.on("error", function() {
			$("#wsstatus").html("error");
		});

		gethWebSocket.on("open", function() {
			$("#wsstatus").html("connected");
		});
	};

	$("#startGethBtn").click(function() {
		var spawn = require('child_process').spawn;
		environ = {};
		for (v in process.env) {
			environ[v] = process.env[v];
		}
		
		if (accessToken.length != accessTokenLength) {
			accessToken = newAccessToken();
		}

		environ["accessToken"] = accessToken;

		geth = spawn("geth", ["--rpccorsdomain=http://localhost:3000", "mist"], {env: environ});

		geth.stderr.on("data", function(line) {
			updateGethLog(line);
		});

		geth.stdin.on("data", function(line) {
			updateGethLog(line);
		});
	});

	$("#openGethWebsocket").click(function() {
		maxRetries = 3;
		openGethWebSocket();
	});

	$("#closeGethWebsocket").click(function() {
		if (gethWebSocket != null) {
			gethWebSocket.close();
		}
	});	
		
	$("#toggleLogBtn").click(function() {
		$(".logPart").toggle();
	});

	$("#toggleEventsBtn").click(function() {
		$(".gethEvents").toggle();
	});

	$("#stopGethBtn").click(function() {
		gethWebSocket.send('{"jsonws":"0.0.1","method":"quit","params":[],"id":1}');
		geth.close();
	});

	$("#loadWalletDappBtn").click(function() {
		$("#dapp-wallet").attr("src", "http://localhost:3000");
	});
	
	$("#startMinerBtn").click(function() {
		gethWebSocket.send('{"jsonrpc":"0.0.1","method":"miner_start","params":[],"id":1}');
	});

	$("#stopMinerBtn").click(function() {
		gethWebSocket.send('{"jsonrpc":"0.0.1","method":"miner_stop","params":[],"id":1}');
	});

	$("#getHashrateBtn").click(function() {
		gethWebSocket.send('{"jsonws":"0.0.1","method":"miner_hashrate","params":[],"id":1}');
	});


	$("#minimizeBtn").click(function() {
		gui.Window.get().minimize();
	});

	$("#maximizeBtn").click(function() {
		gui.Window.get().maximize();
	});

	$("#unmaximizeBtn").click(function() {
		gui.Window.get().unmaximize();
	});

	$("#fullScreenBtn").click(function() {
		gui.Window.get().enterFullscreen();
	});

	$("#leaveFullscreenBtn").click(function() {
		gui.Window.get().leaveFullscreen();
	});	

	$("#exitBtn").click(function() {
		gui.App.quit();
	});

});
