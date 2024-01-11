/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const toggleAction = new Action('de.itnox.streamdeck.tasmota.toggle');

toggleAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice(payload.settings.url);

    t_device.power = !t_device.power;

    setOutlet(context, payload.settings.url, t_device.power, updateOutlet);
});

toggleAction.onWillAppear(({action, context, device, event, payload})=>{
    getOutlet(context, payload.settings.url, updateOutlet);
})

updateOutlet = (context, success, result)=>{
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
