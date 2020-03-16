const http = require("http");

function main(params) {
	const url = params.url;

  http.get(url, (res) => {
		const { statusCode } = res;

		if (statusCode !== 200) {
			console.error('Request Failed. ' + `Status Code: ${statusCode}`);
			// consume response data to free up memory
			res.resume();
			return;
		}

		res.setEncoding('utf8');
		let rawData = '';
		res.on('data', (chunk) => { rawData += chunk; });
		res.on('end', () => {
			try {
				const parsedData = JSON.parse(rawData);
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

				return {averageCPU: average};
			} catch (e) {
				console.error(e.message);
			}
		});
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`);
	});
}