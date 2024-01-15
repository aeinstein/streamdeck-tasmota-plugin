/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const colorAction = new Action('de.itnox.streamdeck.tasmota.color');
const brightnessAction = new Action('de.itnox.streamdeck.tasmota.brightness');
const saturationAction = new Action('de.itnox.streamdeck.tasmota.saturation');
const rgbaction= new Action('de.itnox.streamdeck.tasmota.rgbdevice');
const wwaction= new Action('de.itnox.streamdeck.tasmota.wwdevice');
const fixedAction= new Action('de.itnox.streamdeck.tasmota.fixed');

let downTimer = -1;

const viewStates = [];

const layouts = [
    "layouts/rgb.json",
    "layouts/saturation.json",
    "layouts/brightness.json"
];

const layoutsww = [
    "layouts/colortemp.json",
    "layouts/brightness.json"
]

fixedAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    setSaturation(action, context, payload.settings, 100, updateValue, true);

    if(payload.settings.color != "") {
        setColor(action, context, payload.settings, payload.settings.color, updateValue, true);
    }

    if(payload.settings.brightness != "") {
        setBrightness(action, context, payload.settings, payload.settings.brightness, updateValue, true);
    }
});

fixedAction.onDialDown(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    downTimer = setTimeout(()=>{
        fireHold({action, context, device, event, payload});
        downTimer = -1;
    }, 1000);
});



wwaction.onWillAppear(({action, context, device, event, payload})=>{
    //switch(viewStates[context])
    if(viewStates[context] === undefined) viewStates[context] = 0;
    else $SD.setFeedbackLayout(context, layoutsww[viewStates[context]]);

    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getHSBColor(action, context, payload.settings, updateValue);
        });
    }

    getHSBColor(action, context, payload.settings, updateValue);
})

wwaction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    const t_device = cache.getOrAddDevice(context, payload.settings);
    t_device.setAutoRefresh(0);
    cache.removeContext(context, payload.settings);
});

wwaction.onDialDown(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    downTimer = setTimeout(()=>{
        fireHold({action, context, device, event, payload});
        downTimer = -1;
    }, 1000);
});

wwaction.onDialUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    if(downTimer >= 0) {
        clearInterval(downTimer);
        downTimer = -1;
        firePress({action, context, device, event, payload});
    }
});

wwaction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    switch(viewStates[context]){
    case 0:
        t_device.CT += payload.ticks;

        if(t_device.CT > 500) t_device.CT = 500;
        if(t_device.CT < 153) t_device.CT = 153;

        setCT(action, context, payload.settings, t_device.CT, updateValue);
        break;

    case 1:
        t_device.White += payload.ticks;

        if(t_device.White > 100) t_device.White = 100;
        if(t_device.White < 0) t_device.White = 0;

        setWhite(action, context, payload.settings, t_device.White, updateValue);
        break;
    }
});




rgbaction.onWillAppear(({action, context, device, event, payload})=>{
    //switch(viewStates[context])
    if(viewStates[context] === undefined) viewStates[context] = 0;
    else $SD.setFeedbackLayout(context, layouts[viewStates[context]]);

    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getHSBColor(action, context, payload.settings, updateValue);
        });
    }

    getHSBColor(action, context, payload.settings, updateValue);
})

rgbaction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    const t_device = cache.getOrAddDevice(context, payload.settings);
    t_device.setAutoRefresh(0);
    cache.removeContext(context, payload.settings);
});

rgbaction.onDialDown(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    downTimer = setTimeout(()=>{
        fireHold({action, context, device, event, payload});
        downTimer = -1;
    }, 1000);
});

rgbaction.onDialUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    if(downTimer >= 0) {
        clearInterval(downTimer);
        downTimer = -1;
        firePress({action, context, device, event, payload});
    }
});

rgbaction.onDialRotate(({ action, context, device, event, payload }) => {
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

            setHSBColor(action, context, payload.settings, t_device.HSBColor[0], updateValue);
            break;

        case 1:
            t_device.HSBColor[1] += payload.ticks;

            if(t_device.HSBColor[1] > 100) {
                t_device.HSBColor[1] = 100;
            }

            if(t_device.HSBColor[1] < 0) {
                t_device.HSBColor[1] = 0;
            }

            setSaturation(action, context, payload.settings, t_device.HSBColor[1], updateValue);
            break;

        case 2:
            t_device.HSBColor[2] += payload.ticks;

            if(t_device.HSBColor[2] > 100) {
                t_device.HSBColor[2] = 100;
            }

            if(t_device.HSBColor[2] < 0) {
                t_device.HSBColor[2] = 0;
            }

            setBrightness(action, context, payload.settings, t_device.HSBColor[2], updateValue);
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

        case "de.itnox.streamdeck.tasmota.wwdevice":
            if(isNaN(viewStates[context])) viewStates[context] = 0;

            viewStates[context]++;

            if(viewStates[context] >= layoutsww.length) viewStates[context] = 0;

            $SD.setFeedbackLayout(context, layoutsww[viewStates[context]]);

            let val2 = 0;

            const t_device2 = cache.getOrAddDevice(context, payload.settings);

            switch (viewStates[context]){
                case 0:
                    val2 = t_device2.CT;
                    break;

                case 1:
                    val2 = t_device2.White;
                    break;
            }

            $SD.setFeedback(context, {
                "value": val2,
                "indicator": val2
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

    setHSBColor(action, context, payload.settings, t_device.HSBColor[0], updateValue);
});

colorAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(t_device.HSBColor[0] > 0) t_device.HSBColor[0] = 0;
    else t_device.HSBColor[0] = 180;

    setHSBColor(action, context, payload.settings, t_device.HSBColor[0], updateValue);
});

colorAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 0;
    getHSBColor(action, context, payload.settings, updateValue);
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

    setBrightness(action, context, payload.settings, t_device.HSBColor[2], updateValue);
});

brightnessAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(t_device.HSBColor[2] > 0) t_device.HSBColor[2] = 0;
    else t_device.HSBColor[2] = 100;

    setBrightness(action, context, payload.settings, t_device.HSBColor[2], updateValue, true);
});

brightnessAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 2;
    getHSBColor(action, context, payload.settings, updateValue);
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

    setSaturation(action, context, payload.settings, t_device.HSBColor[1], updateValue);
});

saturationAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice(context, payload.settings);

    if(t_device.HSBColor[1] > 0) t_device.HSBColor[1] = 0;
    else t_device.HSBColor[1] = 100;

    setBrightness(action, context, payload.settings, t_device.HSBColor[1], updateValue, true);
});

saturationAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 2;
    getHSBColor(action, context, payload.settings, updateValue);
})

saturationAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext(context, payload.settings);
});