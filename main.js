// Accessed by number of bits to borrow
const B2B_TABLE = [0,128,192,224,240,248,252,254,255]

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// Appends new output string to output div
function output(outstr) {
    let newOut = document.createElement("p")
    newOut.innerHTML = outstr;
    document.getElementById("output").appendChild(newOut);
}


// Returns class, CIDR value, and default subnet mask
function getInputData(oct1) {
    if (oct1 <= 127) { return ["A",8,"255.0.0.0"]; }
    if (oct1 <= 191) { return ["B",16,"255.255.0.0"]; }
    if (oct1 <= 223) { return ["C",24,"255.255.255.0"]; }
}

// Returns subnet mask based on cidr value
function cidrToMask(CIDR, b2b) {
    let twofivefives = Math.floor(CIDR/8);
    let newMask = "";
    for (let i = 0; i < twofivefives; i++) {
        newMask += "255.";
    }

    while (b2b > 8) { b2b -= 8; }
    newMask += B2B_TABLE[b2b] + "."

    for (let i = 0; i < 4-twofivefives-1; i++) {
        newMask += "0.";
    }

    return newMask.slice(0,-1);
}

// Decide formula based on requirements
function getMask(address, minh, mins) {
    if (minh > 0) {
        // Get with usable hosts
        let x = address.CIDR;
        var usable = Math.pow(2, 32);
        while (minh < usable) {
            usable = Math.pow(2, 32-x) -2
            x+=1;
        }
        let powVal = 32-(x-2);

        // New mask
        usable = Math.pow(2, powVal) - 2;
        var bitsBorrowed = (32-address.CIDR)-powVal;
        var subnets = Math.pow(2, bitsBorrowed);

    } else {
        // Get with subnets
        let x = 1;
        var subnets = 1;
        while (subnets < mins) {
            subnets = Math.pow(2, x);
            x+=1;
        }
        var bitsBorrowed = x-1;
        var usable = Math.pow(2, (32-address.CIDR)-bitsBorrowed)-2;
    }

    var newCIDR = address.CIDR + bitsBorrowed;
    output("New Mask: " + cidrToMask(newCIDR,bitsBorrowed) + " (/" + newCIDR + ")");
    output("Total number of subnets: " + subnets);
    output("Total number of IP addresses: " + (usable + 2));
    output("Total number of usable addresses: " + usable);
    output("Number of bits borrowed from network: " + bitsBorrowed)
}

function calc(form) {
    removeAllChildNodes(document.getElementById("output")); // Clear output
    var elements = form.elements;
    var data ={};
    for(var i = 0 ; i < elements.length ; i++){
        var item = elements.item(i);
        data[item.name] = item.value;
    }

    let inputData = getInputData(data["oct1"])

    // Construct address dict
    let address = {
        octs: [data["oct1"], data["oct2"], data["oct3"], 0],
        CIDR: inputData[1]
    }

    output("Output for address " + address["octs"].join('.') + "/" + address.CIDR);
    output("Address class: " + inputData[0]);
    output("Default subnet mask: " + inputData[2]);
    output("------------------------------")

    // Get min hosts and/or subnets
    let MIN_HOSTS = 0;
    let MIN_SUBNETS = 0;
    if (document.getElementById("hosts").checked) { MIN_HOSTS = data["hosts"]; }
    if (document.getElementById("subnets").checked) { MIN_SUBNETS = data["subnets"]; }
    
    getMask(address, MIN_HOSTS, MIN_SUBNETS);
}