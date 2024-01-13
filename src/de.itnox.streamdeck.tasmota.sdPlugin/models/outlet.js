/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const toggleAction = new Action('de.itnox.streamdeck.tasmota.toggle');

toggleAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice(context, payload.settings.url);

    t_device.POWER = !t_device.POWER;

    setPower(context, payload.settings, t_device.POWER, updateOutlet);
});

toggleAction.onWillAppear(({action, context, device, event, payload})=>{
    getOutlet(context, payload.settings, updateOutlet);
});

toggleAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings.url);
});

updateOutlet = (t_device, success, result)=>{
    console.log(t_device, success, result);

    if(!success) {
        t_device.forEachContext((context)=>{
            $SD.showAlert(context);
        });
        return;
    }

    if(result.POWER === "OFF") {
        t_device.forEachContext((context)=>{
            $SD.setState(context, 0);
            $SD.setTitle(context, "OFF");
        });

        t_device.POWER = 0;

    } else {
        t_device.forEachContext((context)=>{
            $SD.setState(context, 1);
            $SD.setTitle(context, "ON");
        });

        t_device.POWER = 1;
    }
}
