/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const colorAction = new Action('de.itnox.streamdeck.tasmota.color');
const brightnessAction = new Action('de.itnox.streamdeck.tasmota.brightness');
const tempAction = new Action('de.itnox.streamdeck.tasmota.temperature');
const ledaction= new Action('de.itnox.streamdeck.tasmota.rgbdevice');
const fixedAction= new Action('de.itnox.streamdeck.tasmota.fixed');

let downTimer = -1;

const viewStates = [];


const layouts = [
    "layouts/rgb.json",
    "layouts/brightness.json",
    "layouts/temp.json"
]


fixedAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice(payload.settings.url);

    if(payload.settings.color != "") {
        setColor(context, payload.settings.url, payload.settings.color, updateAction);
    }

    if(payload.settings.brightness != "") {
        setColor(context, payload.settings.url, payload.settings.brightness, updateAction);
    }
});





ledaction.onDialDown(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    downTimer = setTimeout(()=>{
        fireHold(context, payload);
        downTimer = -1;
    }, 1000);

});

ledaction.onDialUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    if(downTimer >= 0) {
        clearInterval(downTimer);
        downTimer = -1;
        firePress(context, payload);
    }
});

ledaction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    switch(viewStates[context]){
        case 0:
            t_device.color += payload.ticks;

            if(t_device.color > 100) {
                t_device.color -= 101;
            }

            if(t_device.color < 0) {
                t_device.color += 101;
            }

            setColor(context, payload.settings.url, t_device.color, percent2RGB(t_device.color), updateValue);
            break;

        case 1:
            t_device.brightness += payload.ticks;

            if(t_device.brightness > 100) {
                t_device.brightness = 100;
            }

            if(t_device.brightness < 0) {
                t_device.brightness = 0;
            }

            setBrightness(context, payload.settings.url, t_device.brightness, updateValue);
            break;

        case 2:
            t_device.temp += payload.ticks;

            if(t_device.temp > 100) {
                t_device.temp = 100;
            }

            if(t_device.temp < 0) {
                t_device.temp = 0;
            }

            setTemperature(context, payload.settings.url, t_device.temp, updateValue);
            break;
    }

});

function fireHold(context, payload){
    console.log("fireHold");


}

function firePress(context, payload){
    console.log("firePress");

    if(isNaN(viewStates[context])) viewStates[context] = 0;

    viewStates[context]++;

    if(viewStates[context] >= layouts.length) viewStates[context] = 0;

    $SD.setFeedbackLayout(context, layouts[viewStates[context]]);

    let val = 0;

    const t_device = cache.getOrAddDevice(context, payload.settings.url);

    switch(viewStates[context]){
        case 0:
            val = t_device.color;
            break;

        case 1:
            val = t_device.brightness;
            break;

        case 2:
            val = t_device.temp;
            break;
    }

    $SD.setFeedback(context, {
        "value": val,
        "indicator": val
    });
}

updateValue = (context, url, success, result)=>{
    console.log(context, url, success, result);

    if(!success) {
        $SD.showAlert(context);
        return;
    }
}



colorAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings.url);

    t_device.color += payload.ticks;

    if(t_device.color > 100) t_device.color -= 100;
    if(t_device.color < 0) t_device.color += 100;

    setColor(context, payload.settings.url, t_device.color, percent2RGB(t_device.color), updateValue);
});

colorAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    if(t_device.color > 0) t_device.color = 0;
    else t_device.color = 100;

    setColor(context, payload.settings.url, t_device.color, percent2RGB(t_device.color), updateValue);
});

colorAction.onWillAppear(({action, context, device, event, payload})=>{
    getColor(context, payload.settings.url, updateValue);
})





brightnessAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    t_device.brightness += payload.ticks;

    if(t_device.brightness > 100) {
        t_device.brightness = 100;
        $SD.showAlert(context);
    }
    if(t_device.brightness < 0) {
        t_device.brightness = 0;
        $SD.showAlert(context);
    }

    setBrightness(context, payload.settings.url, t_device.brightness, updateValue);
});

brightnessAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    if(t_device.brightness > 0) t_device.brightness = 0;
    else t_device.brightness = 100;

    setBrightness(context, payload.settings.url, t_device.brightness, updateValue);
});

brightnessAction.onWillAppear(({action, context, device, event, payload})=>{
    getBrightness(context, payload.settings.url, updateValue);
})





tempAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    t_device.temp += payload.ticks;

    if(t_device.temp > 100) {
        t_device.temp = 100;
        $SD.showAlert(context);
    }
    if(t_device.temp < 0) {
        t_device.temp = 0;
        $SD.showAlert(context);
    }

    setTemperature(context, payload.settings.url, t_device.temp, updateValue);
});

tempAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    if(t_device.temp > 0) t_device.temp = 0;
    else t_device.temp = 100;

    setTemperature(context, payload.settings.url, t_device.temp, updateValue);
});

tempAction.onWillAppear(({action, context, device, event, payload})=>{
    getTemperature(context, payload.settings.url, updateValue);
})


