export function extractContractSelectorOption(optionsArray) {
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

export function extractFileSelectorOptions(optionsArray) {
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
