/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const toggleAction = new Action('de.itnox.streamdeck.tasmota.toggle');

toggleAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice(context, payload.settings.url);

    t_device.power = !t_device.power;

    setOutlet(context, payload.settings.url, t_device.power, updateOutlet);
});

toggleAction.onWillAppear(({action, context, device, event, payload})=>{
    getOutlet(context, payload.settings.url, updateOutlet);
});

toggleAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings.url);
});

getOutlet = (context, url, callback) =>{
    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send("/cm?cmnd=Power", callback);
}

setOutlet = (context, url, power, callback) => {
    if(url === "") {
        $SD.showAlert(context);
        return;
    }

    let payload = "/cm?cmnd=Power%20Off";
    if(power) payload = "/cm?cmnd=Power%20On";

    const t_device = cache.getOrAddDevice(context, url);
    t_device.send(payload, callback);
}

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

        t_device.power = 0;

    } else {
        t_device.forEachContext((context)=>{
            $SD.setState(context, 1);
            $SD.setTitle(context, "ON");
        });

        t_device.power = 1;
    }
}
