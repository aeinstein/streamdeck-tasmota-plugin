setColor = (context, url, color)=>{
    console.log("Color: " + color);

    //color = color.replace("#", "");

    $SD.setFeedback(context, {
        "value": color,
        "indicator": color
    });

    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    url += "/cm?cmnd=Color%20" + percent2RGB(color);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

setBrightness = (context, url, brightness, callback)=>{
    console.log("Brightness: " + brightness);

    $SD.setFeedback(context, {
        "value": brightness,
        "indicator": brightness
    });

    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    url += "/cm?cmnd=Brightness%20" + brightness;

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

setTemperature = (context, url, color, callback)=>{
    console.log("Temperature: " + color);

    $SD.setFeedback(context, {
        "value": color,
        "indicator": color
    });
}

getOutlet = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    url += "/cm?cmnd=Power";

    console.log("getState: " + url);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

setOutlet = (context, url, plug, callback) => {
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    if(plug) url += "/cm?cmnd=Power%20On";
    else url += "/cm?cmnd=Power%20Off";

    console.log("setOutlet: " + url);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

getColor = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    url += "/cm?cmnd=Color";

    console.log("getState: " + url);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

getBrightness = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    url += "/cm?cmnd=Brightness";

    console.log("getState: " + url);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

getTemperature = (context, url, callback) =>{
    if(url === "") {
        callback(context, false, "No URL");
        return;
    }

    url += "/cm?cmnd=Temp";

    console.log("getState: " + url);

    const xhr = createXHR(context, callback);
    xhr.open('GET', url, true);
    xhr.send();
}

