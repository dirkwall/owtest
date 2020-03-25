const needle = require("needle");

function func(params) {
	console.log("start");
	const url = params.url;
	console.log("url: ", url);

  return new Promise(function(resolve, reject) {
    needle('get', url)
      .then(function(res) {
        const data = res.body;
        const length = data.length;
        var sum = 0;

        data.forEach(element => {
          sum += element.logicalCpuCores;
        });

        const average = sum/length;
        console.log("average: ", average);
        resolve({averageCPU: average});
      })
      .catch(function(err) {
        console.error(`Got error: ${err}`);
        reject({error: err});
      });
  });
}

exports.main = func;
