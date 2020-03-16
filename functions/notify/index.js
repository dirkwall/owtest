var request = require('request')
var mustache = require('mustache')

function main(params) {
	// endpoint to post message to
	const endpoint = params.endpoint;
	// Message template provided by the user (maybe suggest default template)
	const template = params.template;
	// Placeholders provided by Dynatrace
	const dataString = params.data;
	const data = JSON.parse(dataString)

	var message = mustache.render(template, data)

	request.post(endpoint, {
			json: {
					"text": message
			}
	}, (error, res, body) => {
			if (error) {
				console.error(error)
				return
			}
			else {
				console.log(`statusCode: ${res.statusCode}`)
				return {status: "done"}
			}
	});
}
