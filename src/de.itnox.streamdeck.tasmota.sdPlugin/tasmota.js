setColor = ({action, context, device, event, payload}, color, callback, noQueue = false)=>{
    console.log("setColor: " + color);

    color = color.replace("#", "");

    $SD.setFeedback(context, {
        "value": color,
        "indicator": color
    });

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=Color%20" + color);
}

sendCommand = ({action, context, device, event, payload}, command, callback, noQueue = false)=>{
    console.log("sendCommand: " + command);

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=" + command);
}

setHUE = ({action, context, device, event, payload}, hue, callback, noQueue = false)=>{
    console.log("setHUE: " + hue);

    $SD.setFeedback(context, {
        "value": hue,
        "indicator": hue
    });

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=HSBColor1%20" + hue);
}

setHSBColor = ({action, context, device, event, payload}, hsb, callback, noQueue = false)=>{
    console.log("setHSB: " + hsb);

    if(payload.settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});
    t_device.HSBColor = hsb;

    switch(action){
        case "de.itnox.streamdeck.tasmota.rgbdevice":
            $SD.setFeedback(context, {
                "value": hsb[viewStates[context]],
                "indicator": hsb[viewStates[context]]
            });
            break;
    }

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=HSBColor%20" + t_device.HSBColor[0] + "," + t_device.HSBColor[1] + "," + t_device.HSBColor[2]);
}

setBrightness = ({action, context, device, event, payload}, brightness, callback, noQueue = false)=>{
    console.log("Brightness: " + brightness);

    $SD.setFeedback(context, {
        "value": brightness,
        "indicator": brightness
    });

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=HSBColor3%20" + brightness);
}

setSaturation = ({action, context, device, event, payload}, pos, callback, noQueue = false)=>{
    console.log("saturation: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=HSBColor2%20" + pos);
}

getHSBColor = ({action, context, device, event, payload}, callback, noQueue = false) =>{
    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=HSBColor");
}

setWhite = ({action, context, device, event, payload}, white, callback, noQueue = false)=>{
    console.log("White: " + white);

    $SD.setFeedback(context, {
        "value": white,
        "indicator": white
    });

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=White%20" + white);
}

setCT = ({action, context, device, event, payload}, white, callback, noQueue = false)=>{
    console.log("White: " + white);

    $SD.setFeedback(context, {
        "value": white,
        "indicator": white
    });

    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=CT%20" + white);
}

getPower = ({action, context, device, event, payload}, callback, noQueue = false) =>{
    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=Power");
}

getStatus = ({action, context, device, event, payload}, callback, noQueue = false) =>{
    _send({action, context, device, event, payload, callback, noQueue}, "/cm?cmnd=Status%208");
}

setPower = ({action, context, device, event, payload}, power, callback, noQueue = false) => {
    let querystring = "/cm?cmnd=Power%20Off";
    if(power) querystring = "/cm?cmnd=Power%20On";

    _send({action, context, device, event, payload, callback, noQueue}, querystring);
}

updateValue = (t_device, success, result, senderAction, senderContext)=>{
    console.log(t_device, success, result, senderAction, senderContext);

    if(!success) {
        t_device.forEachContext((context)=>{
            $SD.showAlert(context);
        });
        return;
    }

    if(result.POWER === "OFF") t_device.POWER = 0;
    if(result.POWER === "ON") t_device.POWER = 1;
    if(result.StatusSNS) t_device.StatusSNS = result.StatusSNS;     // Nur wenn Result Powerstatus hat

    if(result.HSBColor) {
        //t_device.POWER = result.POWER !== "OFF";
        t_device.Dimmer = result.Dimmer;
        t_device.White = result.White;
        t_device.CT = result.CT;

        // WHY is HSBColor not an array ;!?!?! grrr
        let ff = result.HSBColor.split(",");
        t_device.HSBColor[0] = Number(ff[0]);
        t_device.HSBColor[1] = Number(ff[1]);
        t_device.HSBColor[2] = Number(ff[2]);
    }

    // Alle, zu diesem Result, passenden Steuerelemente updaten
    t_device.forEachContext((context)=>{
        let action = t_device.actions[context];

        switch(action){
            case "de.itnox.streamdeck.tasmota.fixed":
            case "de.itnox.streamdeck.tasmota.wwfixed":
                // Kein Update da nur Eingang
                break;

            case "de.itnox.streamdeck.tasmota.toggle":
                if(t_device.POWER) {
                    t_device.forEachContext((context)=>{
                        $SD.setState(context, 1);

                        if(t_device.StatusSNS) {
                            switch(t_device.settings[context].titleMode){
                                case "1":
                                    $SD.setTitle(context, t_device.StatusSNS.ENERGY.Power + " W");
                                    //else $SD.setTitle(context, "0 W");
                                    break;

                                case "2":
                                    $SD.setTitle(context, t_device.StatusSNS.ENERGY.Today + " Wh");
                                    //else $SD.setTitle(context, "0 Wh");
                                    break;

                                case "3":
                                    $SD.setTitle(context, t_device.StatusSNS.ENERGY.Total + " Wh");
                                    //else $SD.setTitle(context, "0 Wh");
                                    break;

                                default:
                                    console.log("std titelmode");
                                    $SD.setTitle(context, "ON");
                                    break;
                            }

                        } else {
                            $SD.setTitle(context, "ON");
                        }
                    });
                } else {
                    $SD.setTitle(context, "OFF");
                }

                $SD.setState(context, t_device.POWER);
                break;

            case "de.itnox.streamdeck.tasmota.custom":
                // Nur eigenes Control aktualisieren
                if(senderContext !== context) break;

                let title = "";

                console.log(result);

                for (let x of Object.keys(result)) {
                    title += x + ": " + result[x];
                }

                console.log("setTitle: " + title);
                $SD.setTitle(context, title);
                $SD.showOk(context);
                break;

            case "de.itnox.streamdeck.tasmota.wwdevice":
                switch(viewStates[context]){
                    case 0:
                        $SD.setFeedback(context, {
                            "value": t_device.CT,
                            "indicator": t_device.CT
                        });
                        break;

                    case 1:
                        $SD.setFeedback(context, {
                            "value": t_device.White,
                            "indicator": t_device.White
                        });
                        break;
                }
                break;

            case "de.itnox.streamdeck.tasmota.rgbdevice":
            case "de.itnox.streamdeck.tasmota.brightness":
            case "de.itnox.streamdeck.tasmota.color":
            case "de.itnox.streamdeck.tasmota.saturation":
                console.log("set: " + context + " = " + t_device.HSBColor[viewStates[context]]);
                $SD.setFeedback(context, {
                    "value": t_device.HSBColor[viewStates[context]],
                    "indicator": t_device.HSBColor[viewStates[context]]
                });
                break;

            default:
                console.warn("Action: " + action + " unknown");
                break;
        }
    });
}

_send = ({action, context, device, event, payload, callback, noQueue}, querystring)=>{
    if(payload.settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice({action, context, device, event, payload});
    if(payload.settings.password !== "") querystring += "&user=admin&password=" + payload.settings.password;
    t_device.send({action, context, device, event, payload, querystring}, callback, noQueue);
}

const cache = new Cache();

