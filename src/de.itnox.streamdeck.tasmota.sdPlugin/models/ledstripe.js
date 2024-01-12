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
    "layouts/saturation.json",
    "layouts/brightness.json"
]


fixedAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    if(payload.settings.color != "") {
        setColor(context, payload.settings.url, payload.settings.color, updateValue);
    }

    if(payload.settings.brightness != "") {
        setColor(context, payload.settings.url, payload.settings.brightness, updateValue);
    }
});



ledaction.onWillAppear(({action, context, device, event, payload})=>{
    //switch(viewStates[context])
    if(viewStates[context] === undefined) viewStates[context] = 0;
    getHSBColor(context, payload.settings.url, updateValue);
})

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
    const t_device = cache.getOrAddDevice(context, payload.settings.url);

    switch(viewStates[context]){
        case 0:
            t_device.HSBColor[0] += payload.ticks;

            if(t_device.HSBColor[0] > 360) {
                t_device.HSBColor[0] -= 361;
            }

            if(t_device.HSBColor[0] < 0) {
                t_device.HSBColor[0] += 361;
            }

            setColor(context, payload.settings.url, t_device.HSBColor[0], updateValue);
            break;

        case 1:
            t_device.HSBColor[1] += payload.ticks;

            if(t_device.HSBColor[1] > 100) {
                t_device.HSBColor[1] = 100;
            }

            if(t_device.HSBColor[1] < 0) {
                t_device.HSBColor[1] = 0;
            }

            setTemperature(context, payload.settings.url, t_device.HSBColor[1], updateValue);
            break;

        case 2:
            t_device.HSBColor[2] += payload.ticks;

            if(t_device.HSBColor[2] > 100) {
                t_device.HSBColor[2] = 100;
            }

            if(t_device.HSBColor[2] < 0) {
                t_device.HSBColor[2] = 0;
            }

            setBrightness(context, payload.settings.url, t_device.HSBColor[2], updateValue);
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

    val = t_device.HSBColor[viewStates[context]];

    $SD.setFeedback(context, {
        "value": val,
        "indicator": val
    });
}

updateValue = (t_device, success, result)=>{
    console.log(t_device, success, result);

    if(!success) {
        t_device.forEachContext((context)=>{
            $SD.showAlert(context);
        });
        return;
    }

    // WHY is HSBColor not an array ;!?!?! grrr
    let hsb = result.HSBColor;
    let ff = hsb.split(",");
    t_device.HSBColor[0] = Number(ff[0]);
    t_device.HSBColor[1] = Number(ff[1]);
    t_device.HSBColor[2] = Number(ff[2]);


    t_device.forEachContext((context)=>{
        console.log("set: " + context + " = " + t_device.HSBColor[viewStates[context]]);

        $SD.setFeedback(context, {
            "value": t_device.HSBColor[viewStates[context]],
            "indicator": t_device.HSBColor[viewStates[context]]
        });
    });
}









colorAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings.url);

    t_device.color += payload.ticks;

    if(t_device.color > 100) t_device.color -= 100;
    if(t_device.color < 0) t_device.color += 100;

    setColor(context, payload.settings.url, t_device.color, updateValue);
});

colorAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings.url);

    if(t_device.color > 0) t_device.color = 0;
    else t_device.color = 100;

    setColor(context, payload.settings.url, t_device.color, percent2RGB(t_device.color), updateValue);
});

colorAction.onWillAppear(({action, context, device, event, payload})=>{
    getHSBColor(context, payload.settings.url, updateValue);
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
    getHSBColor(context, payload.settings.url, updateValue);
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
    getHSBColor(context, payload.settings.url, updateValue);
})
