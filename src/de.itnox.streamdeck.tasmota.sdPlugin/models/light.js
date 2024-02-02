/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const colorAction = new Action('de.itnox.streamdeck.tasmota.color');
const brightnessAction = new Action('de.itnox.streamdeck.tasmota.brightness');
const saturationAction = new Action('de.itnox.streamdeck.tasmota.saturation');
const rgbaction= new Action('de.itnox.streamdeck.tasmota.rgbdevice');
const wwaction= new Action('de.itnox.streamdeck.tasmota.wwdevice');
const fixedAction= new Action('de.itnox.streamdeck.tasmota.fixed');
const wwfixedAction= new Action('de.itnox.streamdeck.tasmota.wwfixed');

const viewStates = [];

// Config for MultiController
const layouts = {
    "HSB": [
        ["layouts/rgb.json", "assets/rgb"],
        ["layouts/saturation.json", "assets/saturation"],
        ["layouts/brightness.json", "assets/brightness"]
    ],

    "CWW": [
        ["layouts/colortemp.json", "assets/cww"],
        ["layouts/brightness.json", "assets/brightness"]
    ]
};

fixedAction.onKeyPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);
    setColor({action, context, device, event, payload}, payload.settings.color, updateValue, true);
});

fixedAction.onKeyLongPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.POWER) setPower({action, context, device, event, payload}, 0, updateValue);
    else setPower({action, context, device, event, payload}, 1, updateValue);
});



wwfixedAction.onKeyPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    setCT({action, context, device, event, payload}, payload.settings.ct, updateValue, true);
    setWhite({action, context, device, event, payload}, payload.settings.brightness, updateValue, true);
});

wwfixedAction.onKeyLongPressed(({action, context, device, event, payload}) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.POWER) setPower({action, context, device, event, payload}, 0, updateValue);
    else setPower({action, context, device, event, payload}, 1, updateValue);
});



wwaction.onWillAppear(({action, context, device, event, payload})=>{
    if(viewStates[context] === undefined) viewStates[context] = 0;

    $SD.setFeedbackLayout(context, layouts["CWW"][viewStates[context]][0]);

    $SD.setFeedback(context, {
        "icon": layouts["CWW"][viewStates[context]][1]
    });

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getHSBColor({action, context, device, event, payload}, updateValue);
        });
    }

    getHSBColor({action, context, device, event, payload}, updateValue);
})

wwaction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});
    t_device.setAutoRefresh(-1);
    cache.removeContext({action, context, device, event, payload});
});

wwaction.onDialPressed(({action, context, device, event, payload})=> {
    if(isNaN(viewStates[context])) viewStates[context] = 0;

    viewStates[context]++;

    if(viewStates[context] >= layouts["CWW"].length) viewStates[context] = 0;

    $SD.setFeedbackLayout(context, layouts["CWW"][viewStates[context]][0]);

    let val = 0;

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    switch (viewStates[context]){
    case 0:
        val = t_device.CT;
        break;

    case 1:
        val = t_device.White;
        break;
    }

    $SD.setFeedback(context, {
        "value": val,
        "indicator": val,
        "icon": layouts["CWW"][viewStates[context]][1]
    });
});

wwaction.onDialLongPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.POWER) setPower({action, context, device, event, payload}, 0, updateValue);
    else setPower({action, context, device, event, payload}, 1, updateValue);
});

wwaction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({ action, context, device, event, payload });

    switch(viewStates[context]){
    case 0:
        t_device.CT += payload.ticks;

        if(t_device.CT > 500) t_device.CT = 500;
        if(t_device.CT < 153) t_device.CT = 153;

        setCT({ action, context, device, event, payload }, t_device.CT, updateValue);
        break;

    case 1:
        t_device.White += payload.ticks;

        if(t_device.White > 100) t_device.White = 100;
        if(t_device.White < 0) t_device.White = 0;

        setWhite({ action, context, device, event, payload }, t_device.White, updateValue);
        break;
    }
});



rgbaction.onWillAppear(({action, context, device, event, payload})=>{
    //switch(viewStates[context])
    if(viewStates[context] === undefined) viewStates[context] = 0;

    $SD.setFeedbackLayout(context, layouts["HSB"][viewStates[context]][0]);

    $SD.setFeedback(context, {
        "icon": layouts["HSB"][viewStates[context]][1]
    });

    const t_device = cache.getOrAddDevice({ action, context, device, event, payload });

    if(payload.settings.autoRefresh >= 0) {
        t_device.setAutoRefresh(payload.settings.autoRefresh, ()=>{
            getHSBColor({ action, context, device, event, payload }, updateValue);
        });
    }

    getHSBColor({action, context, device, event, payload}, updateValue);
})

rgbaction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});
    t_device.setAutoRefresh(-1);
    cache.removeContext({action, context, device, event, payload});
});

rgbaction.onDialPressed(({action, context, device, event, payload})=> {
    console.log( action, context, device, event, payload);

    if(isNaN(viewStates[context])) viewStates[context] = 0;

    viewStates[context]++;

    if(viewStates[context] >= layouts["HSB"].length) viewStates[context] = 0;

    // Select Layout
    $SD.setFeedbackLayout(context, layouts["HSB"][viewStates[context]][0]);

    let val = 0;

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    val = t_device.HSBColor[viewStates[context]];

    let layout_prefs = {
        "value": val,
        "indicator": val,
        "icon": layouts["HSB"][viewStates[context]][1]
    };

    if(viewStates[context] === LAYOUT_SATURATION) {
        let hue = t_device.HSBColor[LAYOUT_HUE];
        let color_string = rgb2hex(...hsl2rgb(hue, 1, 0.5));

        layout_prefs["indicator"] = {
            "bar_bg_c": "0:#ffffff,1:" + color_string,
            "value": t_device.HSBColor[viewStates[context]]
        }
    }

    $SD.setFeedback(context, layout_prefs);
});

rgbaction.onDialLongPressed(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.POWER) setPower({action, context, device, event, payload}, 0, updateValue);
    else setPower({action, context, device, event, payload}, 1, updateValue);
});

rgbaction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    switch(viewStates[context]){
        case 0:
            t_device.HSBColor[0] += payload.ticks;

            if(t_device.HSBColor[0] > 360) {
                t_device.HSBColor[0] -= 361;
            }

            if(t_device.HSBColor[0] < 0) {
                t_device.HSBColor[0] += 361;
            }

            setHUE({action, context, device, event, payload}, t_device.HSBColor[0], updateValue);
            break;

        case 1:
            t_device.HSBColor[1] += payload.ticks;

            if(t_device.HSBColor[1] > 100) {
                t_device.HSBColor[1] = 100;
            }

            if(t_device.HSBColor[1] < 0) {
                t_device.HSBColor[1] = 0;
            }

            setSaturation({action, context, device, event, payload}, t_device.HSBColor[1], updateValue);
            break;

        case 2:
            t_device.HSBColor[2] += payload.ticks;

            if(t_device.HSBColor[2] > 100) {
                t_device.HSBColor[2] = 100;
            }

            if(t_device.HSBColor[2] < 0) {
                t_device.HSBColor[2] = 0;
            }

            setBrightness({action, context, device, event, payload}, t_device.HSBColor[2], updateValue);
            break;
    }

});



colorAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    t_device.HSBColor[0] += payload.ticks;

    if(t_device.HSBColor[0] > 360) t_device.HSBColor[0] -= 361;
    if(t_device.HSBColor[0] < 0) t_device.HSBColor[0] += 361;

    setHUE({action, context, device, event, payload}, t_device.HSBColor[0], updateValue);
});

colorAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.HSBColor[0] > 0) t_device.HSBColor[0] = 0;
    else t_device.HSBColor[0] = 180;

    setHUE({action, context, device, event, payload}, t_device.HSBColor[0], updateValue);
});

colorAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 0;
    getHSBColor({action, context, device, event, payload}, updateValue);
})

colorAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext({action, context, device, event, payload});
});



brightnessAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    t_device.HSBColor[2] += payload.ticks;

    if(t_device.HSBColor[2] > 100) t_device.HSBColor[2] = 100;
    if(t_device.HSBColor[2] < 0) t_device.HSBColor[2] = 0;

    setBrightness({action, context, device, event, payload}, t_device.HSBColor[2], updateValue);
});

brightnessAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.HSBColor[2] > 0) t_device.HSBColor[2] = 0;
    else t_device.HSBColor[2] = 100;

    setBrightness({action, context, device, event, payload}, t_device.HSBColor[2], updateValue, true);
});

brightnessAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 2;
    getHSBColor({action, context, device, event, payload}, updateValue);
})

brightnessAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext({action, context, device, event, payload});
});



saturationAction.onDialRotate(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    t_device.HSBColor[1] += payload.ticks;

    if(t_device.HSBColor[1] > 100) t_device.HSBColor[1] = 100;
    if(t_device.HSBColor[1] < 0) t_device.HSBColor[1] = 0;

    setSaturation({action, context, device, event, payload}, t_device.HSBColor[1], updateValue);
});

saturationAction.onDialUp(({ action, context, device, event, payload }) => {
    const t_device = cache.getOrAddDevice({action, context, device, event, payload});

    if(t_device.HSBColor[1] > 0) t_device.HSBColor[1] = 0;
    else t_device.HSBColor[1] = 100;

    setBrightness({action, context, device, event, payload}, t_device.HSBColor[1], updateValue, true);
});

saturationAction.onWillAppear(({action, context, device, event, payload})=>{
    viewStates[context] = 1;
    getHSBColor({action, context, device, event, payload}, updateValue);
})

saturationAction.onWillDisappear(({action, context, device, event, payload}) =>{
    console.log( action, context, device, event, payload);
    cache.removeContext({action, context, device, event, payload});
});
