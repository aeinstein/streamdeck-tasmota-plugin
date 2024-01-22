/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const powerAction = new Action('de.itnox.streamdeck.tasmota.toggle');

powerAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    t_device.POWER = !t_device.POWER;

    setPower({action, context, device, event, payload}, t_device.POWER, updateValue, true);
});

powerAction.onWillAppear(({action, context, device, event, payload})=>{
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    getPower({action, context, device, event, payload}, updateValue);

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getStatus({action, context, device, event, payload}, updateValue);
        });
    }
});

powerAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});
    t_device.setAutoRefresh(0);
    cache.removeContext({action, context, device, event, payload});
});
