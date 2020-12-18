export function setSelectorOption(optionsArray) {
  const options = [];
  optionsArray.map((obj) => {
    const optItm = {
      value: obj,
      label: obj,
    };
    return options.push(optItm);
  });
  return options;
}

export function setGanacheAccountsOption(optionsArray) {
  const options = [];
  optionsArray.map((obj) => {
    const optItm = {
      value: obj,
      label: obj,
      type: 'Ganache',
    };
    return options.push(optItm);
  });
  return options;
}

export function setLocalAccountOption(optionsArray) {
  const options = [];
  optionsArray.map((obj) => {
    const optItm = {
      value: obj.checksumAddress,
      label: obj.pubAddress,
      type: 'Local',
      pubAddress: obj.pubAddress,
      checksumAddress: obj.checksumAddress,
    };
    return options.push(optItm);
  });
  return options;
}

export function setFileSelectorOptions(optionsArray) {
  const options = [];
  optionsArray.map((file) => {
    const optItm = {
      value: file,
      label: file.substring(file.lastIndexOf('/') + 1),
    };
    return options.push(optItm);
  });
  return options;
}

export function solidityVersion(versions, latestRelease) {
  const options = [];
  let vs = Object.keys(versions);
  vs = vs[0] === latestRelease ? vs : vs.reverse();
  vs.map((v) => {
    const optItm = {
      value: versions[v].split('soljson-')[1].split('.js')[0],
      label: v,
    };
    return options.push(optItm);
  });
  return options;
}
