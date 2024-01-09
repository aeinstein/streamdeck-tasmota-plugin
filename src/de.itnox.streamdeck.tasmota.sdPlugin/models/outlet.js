/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

let plug = false;

const toggleAction = new Action('de.itnox.streamdeck.tasmota.toggle');

toggleAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    plug = !plug;

    setOutlet(context, payload.settings.url, plug, updateAction);
});

toggleAction.onWillAppear(({action, context, device, event, payload})=>{
    getOutlet(context, payload.settings.url, updateAction);
})

updateAction = (context, success, result)=>{
    console.log(result);

    if(!success) {
        $SD.showAlert(context);
        return;
    }

    if(result.POWER === "OFF") {
        $SD.setState(context, 0);
        $SD.setTitle(context, "OFF");

    } else {
        $SD.setState(context, 1);
        $SD.setTitle(context, "ON");
    }
}

