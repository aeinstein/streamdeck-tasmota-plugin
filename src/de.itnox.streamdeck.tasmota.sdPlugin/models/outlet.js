/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const toggleAction = new Action('de.itnox.streamdeck.tasmota.toggle');

toggleAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice(context, payload.settings);

    t_device.POWER = !t_device.POWER;

    setPower(action, context, payload.settings, t_device.POWER, updateValue);
});

toggleAction.onWillAppear(({action, context, device, event, payload})=>{
    const t_device = cache.getOrAddDevice(context, payload.settings);

    getStatus(action, context, payload.settings, updateValue);

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getStatus(action, context, payload.settings, updateValue);
        });
    }
});

toggleAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    const t_device = cache.getOrAddDevice(context, payload.settings);
    t_device.setAutoRefresh(0);
    cache.removeContext(context, payload.settings);
});
