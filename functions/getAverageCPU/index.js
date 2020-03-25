const needle = require("needle");

function main(params) {
	console.log("start");
	const url = params.url;
	console.log("url: ", url);

	needle('get', url)
		.then(function(res) {
			console.log("mkay");
			const data = res.body;
			console.log(data);

			const length = data.length;
			var sum = 0;

			data.forEach(element => {
				sum += element.logicalCpuCores;
			});

			const average = sum/length;
			console.log("average: ", average);

			return {averageCPU: average};
		})
		.catch(function(err) {
			console.error(`Got error: ${err}`);
		});
}

// For testing
//main({url:"localhost:8080"});
