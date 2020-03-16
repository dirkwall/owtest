const mustache = require('mustache');
const http = require('http');

function func(params) {
	// endpoint to post message to
	const endpoint = params.endpoint;
	// Message template provided by the user (maybe suggest default template)
	const template = params.template;
	// Placeholders provided by Dynatrace
	const data = params.data;
	
	const message = mustache.render(template, data);
	const postData = JSON.stringify({"test":message});

	const options = {
		hostname: endpoint.split(":")[0],
		port: endpoint.split(":")[1],
		path: '/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const req = http.request(options, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		return {status: "done"};
	});

	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
	});

	req.write(postData);
	req.end();
}

exports.main = func;