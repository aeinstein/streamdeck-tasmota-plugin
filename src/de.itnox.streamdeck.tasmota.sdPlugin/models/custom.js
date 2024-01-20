const customAction= new Action('de.itnox.streamdeck.tasmota.custom');

customAction.onKeyPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);
    sendCommand({action, context, device, event, payload}, payload.settings.command1, updateValue, true);
});

customAction.onKeyLongPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);
    sendCommand({action, context, device, event, payload}, payload.settings.command2, updateValue, true);
});
