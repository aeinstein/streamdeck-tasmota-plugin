/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const colorAction = new Action('de.itnox.streamdeck.tasmota.color');
const brightnessAction = new Action('de.itnox.streamdeck.tasmota.brightness');
const saturationAction = new Action('de.itnox.streamdeck.tasmota.saturation');
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

    setSaturation(context, payload.settings, 100, updateValue, true);

    if(payload.settings.color != "") {
        setColor(context, payload.settings, payload.settings.color, updateValue, true);
    }

    if(payload.settings.brightness != "") {
        setBrightness(context, payload.settings, payload.settings.brightness, updateValue, true);
    }
});

fixedAction.onDialDown(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    downTimer = setTimeout(()=>{
        fireHold({action, context, device, event, payload});
        downTimer = -1;
    }, 1000);
});




ledaction.onWillAppear(({action, context, device, event, payload})=>{
    //switch(viewStates[context])
    if(viewStates[context] === undefined) viewStates[context] = 0;
    else $SD.setFeedbackLayout(context, layouts[viewStates[context]]);

    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getHSBColor(context, payload.settings, updateValue);
        });
    }

    getHSBColor(context, payload.settings, updateValue);
})

ledaction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings);
});

ledaction.onDialDown(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    downTimer = setTimeout(()=>{
        fireHold({action, context, device, event, payload});
        downTimer = -1;
    }, 1000);
});

ledaction.onDialUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    if(downTimer >= 0) {
        clearInterval(downTimer);
        downTimer = -1;
        firePress({action, context, device, event, payload});
    }
});

ledaction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    switch(viewStates[context]){
        case 0:
            t_device.HSBColor[0] += payload.ticks;

            if(t_device.HSBColor[0] > 360) {
                t_device.HSBColor[0] -= 361;
            }

            if(t_device.HSBColor[0] < 0) {
                t_device.HSBColor[0] += 361;
            }

            setHSBColor(context, payload.settings, t_device.HSBColor[0], updateValue);
            break;

        case 1:
            t_device.HSBColor[1] += payload.ticks;

            if(t_device.HSBColor[1] > 100) {
                t_device.HSBColor[1] = 100;
            }

            if(t_device.HSBColor[1] < 0) {
                t_device.HSBColor[1] = 0;
            }

            setSaturation(context, payload.settings, t_device.HSBColor[1], updateValue);
            break;

        case 2:
            t_device.HSBColor[2] += payload.ticks;

            if(t_device.HSBColor[2] > 100) {
                t_device.HSBColor[2] = 100;
            }

            if(t_device.HSBColor[2] < 0) {
                t_device.HSBColor[2] = 0;
            }

            setBrightness(context, payload.settings, t_device.HSBColor[2], updateValue);
            break;
    }

});

function fireHold({action, context, device, event, payload}){
    console.log("fireHold");
    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(t_device.POWER) setPower(context, payload.settings, 0, updateValue);
    else setPower(context, payload.settings, 1, updateValue);
}

function firePress({action, context, device, event, payload}){
    console.log("firePress");

    switch(action){
        case "de.itnox.streamdeck.tasmota.fixed":


            break;

        case "de.itnox.streamdeck.tasmota.rgbdevice":
            if(isNaN(viewStates[context])) viewStates[context] = 0;

            viewStates[context]++;

            if(viewStates[context] >= layouts.length) viewStates[context] = 0;

            $SD.setFeedbackLayout(context, layouts[viewStates[context]]);

            let val = 0;

            const t_device = cache.getOrAddDevice(context, payload.settings);

            val = t_device.HSBColor[viewStates[context]];

            $SD.setFeedback(context, {
                "value": val,
                "indicator": val
            });

            break;

        default:
            console.log("action: " + action);
            break;
    }
}




colorAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    t_device.HSBColor[0] += payload.ticks;

    if(t_device.HSBColor[0] > 360) t_device.HSBColor[0] -= 361;
    if(t_device.HSBColor[0] < 0) t_device.HSBColor[0] += 361;

    setHSBColor(context, payload.settings, t_device.HSBColor[0], updateValue);
});

colorAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(t_device.HSBColor[0] > 0) t_device.HSBColor[0] = 0;
    else t_device.HSBColor[0] = 180;

    setHSBColor(context, payload.settings, t_device.HSBColor[0], updateValue);
});

colorAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 0;
    getHSBColor(context, payload.settings, updateValue);
})

colorAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings);
});



brightnessAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    t_device.HSBColor[2] += payload.ticks;

    if(t_device.HSBColor[2] > 100) t_device.HSBColor[2] = 100;
    if(t_device.HSBColor[2] < 0) t_device.HSBColor[2] = 0;

    setBrightness(context, payload.settings, t_device.HSBColor[2], updateValue);
});

brightnessAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings);

    if(t_device.HSBColor[2] > 0) t_device.HSBColor[2] = 0;
    else t_device.HSBColor[2] = 100;

    setBrightness(context, payload.settings, t_device.HSBColor[2], updateValue, true);
});

brightnessAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 2;
    getHSBColor(context, payload.settings, updateValue);
})

brightnessAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings);
});


saturationAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    t_device.HSBColor[1] += payload.ticks;

    if(t_device.HSBColor[1] > 100) t_device.HSBColor[1] = 100;
    if(t_device.HSBColor[1] < 0) t_device.HSBColor[1] = 0;

    setSaturation(context, payload.settings, t_device.HSBColor[1], updateValue);
});

saturationAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(payload.settings);

    if(t_device.HSBColor[1] > 0) t_device.HSBColor[1] = 0;
    else t_device.HSBColor[1] = 100;

    setBrightness(context, payload.settings, t_device.HSBColor[1], updateValue, true);
});

saturationAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 2;
    getHSBColor(context, payload.settings, updateValue);
})

saturationAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings);
});