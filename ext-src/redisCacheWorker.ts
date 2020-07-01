const redis = require('redis');
const client = redis.createClient();

process.on('message', m => {
  if(m.command == 'set') {
    client.set(m.key, m.value, (err: any, result: any) => {
      if(err) {
        // @ts-ignore
        process.send({ error: err });
      } else if(result) {
        // @ts-ignore
        process.send({ configSet: result });
      }
    });
  } else if(m.command === 'get') {
    client.get(m.key, (err: any, values: any) => {
      if(err) {
        // @ts-ignore
        process.send({ error: err });
      } else if(values) {
        // @ts-ignore
        process.send({ configGet: values });
      }
    });
  }
});