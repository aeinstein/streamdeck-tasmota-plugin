setColor = (context, settings, color, callback, noQueue)=>{
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

    const t_device = cache.getOrAddDevice(context, settings.url);
    let payload = "/cm?cmnd=Color%20" + color
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback, noQueue);
}

setHSBColor = (context, settings, pos, callback)=>{
    console.log("setHSBColor: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings.url);
    let payload = "/cm?cmnd=HSBColor1%20" + pos;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback);
}

setBrightness = (context, settings, brightness, callback, noQueue)=>{
    console.log("Brightness: " + brightness);

    $SD.setFeedback(context, {
        "value": brightness,
        "indicator": brightness
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings.url);
    let payload = "/cm?cmnd=HSBColor3%20" + brightness;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback, noQueue);
}

setSaturation = (context, settings, pos, callback, noQueue)=>{
    console.log("saturation: " + pos);

    $SD.setFeedback(context, {
        "value": pos,
        "indicator": pos
    });

    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings.url);
    let payload = "/cm?cmnd=HSBColor2%20" + pos;
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback, noQueue);
}

getHSBColor = (context, settings, callback) =>{
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings.url);
    let payload = "/cm?cmnd=HSBColor";
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback, true);
}

getOutlet = (context, settings, callback) =>{
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    const t_device = cache.getOrAddDevice(context, settings.url);
    let payload = "/cm?cmnd=Power";
    if(settings.password !== "") payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback);
}

setPower = (context, settings, power, callback) => {
    if(settings.url === "") {
        $SD.showAlert(context);
        return;
    }

    let payload = "/cm?cmnd=Power%20Off";
    if(power) payload = "/cm?cmnd=Power%20On";

    const t_device = cache.getOrAddDevice(context, settings.url);
    if(settings.password) payload += "&user=admin&password=" + settings.password;
    t_device.send(payload, callback);
}

const cache = new Cache();

