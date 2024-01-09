/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />



/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
	console.log(actionInfo, appInfo, connection, messageType, port, uuid);
});

