percent2RGB = (col) =>{
    // 0:#ff0000,0.33:#00ff00,0.66:#0000ff,1:#ff0000

    const gradient = {
        0: [255,0,0],
        33: [0,255,0],
        66: [0,0,255],
        100: [255,0,0]
    };

    let start, end;

    for (const k in gradient) {
        if(k == col) {
            start = k;
            end = k;
            break;
        }

        if(k < col) {
            start = k;
        }

        if(k > col) {
            end = k;
            break;
        }
    }


    let red = interpolateValue(gradient[start][0], gradient[end][0], start, end, col);
    let green = interpolateValue(gradient[start][1], gradient[end][1], start, end, col);
    let blue = interpolateValue(gradient[start][2], gradient[end][2], start, end, col);


    return "" + red.toString(16).padStart(2, '0') +
        green.toString(16).padStart(2, '0') +
        blue.toString(16).padStart(2, '0');
}


interpolateValue = (start_color, end_color, start_val, end_val, val)=>{
    if(start_color == end_color) return start_color;

    let steps = (end_val - start_val);
    let step_size = (end_color - start_color) / steps;
    val -= start_val;
    return Math.floor(start_color + (step_size *val));
}

createXHR = (context, callback)=>{
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.timeout = 2000;

    xhr.onerror = () => {
        callback(context, false, 'Unable to connect to the bridge.');
    };

    xhr.ontimeout = () => {
        callback(context, false, 'Connection to the bridge timed out.');
    };

    xhr.onload = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE || xhr.status !== 200) callback(context, false, 'Could not connect to tasmota device.');
        if (xhr.response === undefined || xhr.response == null) callback(context, false, 'Bridge response is undefined or null.');

        let result = xhr.response;

        console.log("result: ",xhr.response);

        callback(context, true, result);
    };

    return xhr;
}

