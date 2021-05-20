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
