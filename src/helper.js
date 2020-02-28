export function solidityVersion(versions) {
  console.log("call in helper");
  var options = [];
    Object.keys(versions).reverse().map((v, i) => {
    const optItm = {
      value: versions[v].split("soljson-")[1].split(".js")[0],
      label: v
    };
    options.push(optItm);
  });
  return options;
}