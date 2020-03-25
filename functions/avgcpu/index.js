const needle = require("needle");

async function func(params) {
	console.log("start");
	const url = params.url;
	console.log("url: ", url);

	const result = await needle('get', url);
	const data = result.body;
	const length = data.length;
	let sum = 0;

	data.forEach(element => {
		sum += element.logicalCpuCores;
	});

	const average = sum/length;
	console.log("average: ", average);
	return { averageCPU: average };
}

exports.main = func;
