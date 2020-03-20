export function setSelectorOption(optionsArray) {
  var options = [];
  optionsArray.map(obj => {
    const optItm = {
      value: obj,
      label: obj
    };
    return options.push(optItm);
  });
  return options;
}

export function setLocalAccountOption(optionsArray) {
  var options = [];
  optionsArray.map(obj => {
    const optItm = {
      value: obj.pubAddress,
      label: obj.checksumAddress
    };
    return options.push(optItm);
  });
  return options;
}

export function setFileSelectorOptions(optionsArray) {
  var options = [];
  optionsArray.map(file => {
    const optItm = {
      value: file,
      label: file.substring(file.lastIndexOf("/") + 1)
    };
    return options.push(optItm);
  });
  return options;
}

export function solidityVersion(versions) {
  var options = [];
    Object.keys(versions).reverse().map((v, i) => {
    const optItm = {
      value: versions[v].split("soljson-")[1].split(".js")[0],
      label: v
    };
    return options.push(optItm);
  });
  return options;
}