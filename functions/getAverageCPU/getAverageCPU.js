const http = require("http");

function main(params) {
	console.log("start");
	const url = params.url;
	console.log("url: ", url);

  http.get(url, (res) => {
		let data = '';

		res.on('data', (chunk) => {
			data += chunk; 
		});
		res.on('end', () => {
			const parsedData = JSON.parse(data);
			console.log(parsedData);

			// example data point:
			// { ...
			//	 "logicalCpuCores": 16,
			// ...}
			const length = parsedData.length;
			var sum = 0;

			parsedData.forEach(element => {
				sum += element.logicalCpuCores;
			});

			const average = sum/length;
			console.log("average: ", average);

			return {averageCPU: average};
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}