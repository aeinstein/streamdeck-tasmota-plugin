/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const colorAction = new Action('de.itnox.streamdeck.tasmota.color');
const brightnessAction = new Action('de.itnox.streamdeck.tasmota.brightness');
const tempAction = new Action('de.itnox.streamdeck.tasmota.temperature');
const ledaction= new Action('de.itnox.streamdeck.tasmota.rgbdevice');
const fixedAction= new Action('de.itnox.streamdeck.tasmota.fixed');

let color = 0;
let brightness = 0;
let temp = 0;
let downTimer = -1;
let currentView = 0;

const layouts = [
    "layouts/rgb.json",
    "layouts/brightness.json",
    "layouts/temp.json"
]


fixedAction.onKeyUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

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
        fireHold(context);
        downTimer = -1;
    }, 500);

});

ledaction.onDialUp(({action, context, device, event, payload})=>{
    console.log( action, context, device, event, payload);

    if(downTimer >= 0) {
        clearInterval(downTimer);
        downTimer = -1;
        firePress(context);
    }
});

ledaction.onDialRotate(({ action, context, device, event, payload }) => {

    switch(currentView){
        case 0:
            color += payload.ticks;

            if(color > 100) {
                color -= 101;
            }

            if(color < 0) {
                color += 101;
            }

            setColor(context, payload.settings.url, color, updateAction);
            break;

        case 1:
            brightness += payload.ticks;

            if(brightness > 100) {
                brightness = 100;
            }

            if(brightness < 0) {
                brightness = 0;
            }

            setBrightness(context, payload.settings.url, brightness, updateValue);
            break;

        case 2:
            temp += payload.ticks;

            if(temp > 100) {
                temp = 100;
            }

            if(temp < 0) {
                temp = 0;
            }

            setTemperature(context, payload.settings.url, temp, updateValue);
            break;
    }

});

function fireHold(context){
    console.log("fireHold");
}

function firePress(context){
    console.log("firePress");
    currentView++;

    if(currentView >= layouts.length) currentView = 0;

    $SD.setFeedbackLayout(context, layouts[currentView]);

    let val = 0;

    switch(currentView){
        case 0:
            val = color;
            break;

        case 1:
            val = brightness;
            break;

        case 2:
            val = temp;
            break;
    }

    $SD.setFeedback(context, {
        "value": val,
        "indicator": val
    });

}

updateValue = (context, success, result)=>{
    console.log(result);

    if(!success) {
        $SD.showAlert(context);
        return;
    }
}

colorAction.onDialRotate(({ action, context, device, event, payload }) => {
    color += payload.ticks;

    if(color > 100) {
        color = 100;
        $SD.showAlert(context);
    }

    if(color < 0) {
        color = 0;
        $SD.showAlert(context);
    }

    setColor(context, payload.settings.url, color, updateAction);
});

colorAction.onDialUp(({ action, context, device, event, payload }) => {
    if(color > 0) color = 0;
    else color = 100;

    setColor(context, payload.settings.url, color);
});

colorAction.onWillAppear(({action, context, device, event, payload})=>{
    getColor(context, payload.settings.url, updateValue);
})





brightnessAction.onDialRotate(({ action, context, device, event, payload }) => {
    brightness += payload.ticks;

    if(brightness > 100) {
        brightness = 100;
        $SD.showAlert(context);
    }
    if(brightness < 0) {
        brightness = 0;
        $SD.showAlert(context);
    }

    setBrightness(context, payload.settings.url, brightness, updateValue);
});

brightnessAction.onDialUp(({ action, context, device, event, payload }) => {
    if(brightness > 0) brightness = 0;
    else brightness = 100;

    setBrightness(context, payload.settings.url, brightness);
});

brightnessAction.onWillAppear(({action, context, device, event, payload})=>{
    getBrightness(context, payload.settings.url, updateValue);
})





tempAction.onDialRotate(({ action, context, device, event, payload }) => {
    temp += payload.ticks;

    if(temp > 100) {
        temp = 100;
        $SD.showAlert(context);
    }
    if(temp < 0) {
        temp = 0;
        $SD.showAlert(context);
    }

    setTemperature(context, payload.settings.url, temp);
});

tempAction.onDialUp(({ action, context, device, event, payload }) => {
    if(temp > 0) temp = 0;
    else temp = 100;

    setBrightness(context, payload.settings.url, temp);
});

tempAction.onWillAppear(({action, context, device, event, payload})=>{
    getTemperature(context, payload.settings.url, updateValue);
})


