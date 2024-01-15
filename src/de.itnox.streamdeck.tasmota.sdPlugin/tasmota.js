setColor = (action, context, settings, color, callback, noQueue)=>{
    console.log("setColor: " + color);

    color = color.replace("#", "");

    $SD.setFeedback(context, {
        "value": color,
        "indicator": color
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=Color%20" + color
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback, noQueue);
}

setHSBColor = (action, context, settings, pos, callback)=>{
    console.log("setHSBColor: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=HSBColor1%20" + pos;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback);
}

setBrightness = (action, context, settings, brightness, callback, noQueue)=>{
    console.log("Brightness: " + brightness);

    $SD.setFeedback(context, {
        "value": brightness,
        "indicator": brightness
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=HSBColor3%20" + brightness;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback, noQueue);
}

setSaturation = (action, context, settings, pos, callback, noQueue)=>{
    console.log("saturation: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=HSBColor2%20" + pos;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback, noQueue);
}

getHSBColor = (action, context, settings, callback) =>{
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=HSBColor";
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback);
}

setWhite = (action, context, settings, white, callback, noQueue)=>{
    console.log("White: " + white);

    $SD.setFeedback(context, {
        "value": white,
        "indicator": white
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=White%20" + white;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback, noQueue);
}

setCT = (action, context, settings, white, callback, noQueue)=>{
    console.log("White: " + white);

    $SD.setFeedback(context, {
        "value": white,
        "indicator": white
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=CT%20" + white;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback, noQueue);
}

getPower = (action, context, settings, callback) =>{
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=Power";
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback);
}

getStatus = (action, context, settings, callback) =>{
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings);
    let payload = "/cm?cmnd=Status%208";
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback);
}

setPower = (action, context, settings, power, callback) => {
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    let payload = "/cm?cmnd=Power%20Off";
    if(power) payload = "/cm?cmnd=Power%20On";

    const t_device = cache.getOrAddDevice(context, settings);
    if(settings.password) payload += "&user=admin&password=" + settings.password;
    t_device.send(action, payload, callback);
}

updateValue = (t_device, success, result, senderAction)=>{
    console.log(t_device, success, result, senderAction);

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

        t_device.POWER = 0;

    } else {
        if(t_device.settings.autoRefresh >= 0 )  {
            t_device.forEachContext((context)=>{
                $SD.setState(context, 1);

                switch(t_device.settings.titleMode){
                    case "0":
                        $SD.setTitle(context, "ON");
                        break;

                    case "1":
                        if(result.StatusSNS.ENERGY.Power) $SD.setTitle(context, result.StatusSNS.ENERGY.Power + " W");
                        else $SD.setTitle(context, "0 W");
                        break;

                    case "2":
                        if(result.StatusSNS.ENERGY.Today) $SD.setTitle(context, result.StatusSNS.ENERGY.Today + " Wh");
                        else $SD.setTitle(context, "0 Wh");
                        break;

                    case "3":
                        if(result.StatusSNS.ENERGY.Total) $SD.setTitle(context, result.StatusSNS.ENERGY.Total + " Wh");
                        else $SD.setTitle(context, "0 Wh");
                        break;
                }
            });

        } else {
            t_device.forEachContext((context)=>{
                $SD.setState(context, 1);
                $SD.setTitle(context, "ON");
            });
        }

        t_device.POWER = 1;
    }

    if(!result.HSBColor) return;    // No RGB

    //t_device.POWER = result.POWER !== "OFF";
    t_device.Dimmer = result.Dimmer;
    t_device.White = result.White;
    t_device.CT = result.CT;

    // WHY is HSBColor not an array ;!?!?! grrr
    let hsb = result.HSBColor;
    let ff = hsb.split(",");
    t_device.HSBColor[0] = Number(ff[0]);
    t_device.HSBColor[1] = Number(ff[1]);
    t_device.HSBColor[2] = Number(ff[2]);



    t_device.forEachContext((context)=>{
        console.log("set: " + context + " = " + t_device.HSBColor[viewStates[context]]);

        if(viewStates[context] === undefined) {
            // Regler kein Multi

        } else {
            switch(senderAction){
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

                default:
                    $SD.setFeedback(context, {
                        "value": t_device.HSBColor[viewStates[context]],
                        "indicator": t_device.HSBColor[viewStates[context]]
                    });
                    break;
            }

        }
    });
}

const cache = new Cache();

