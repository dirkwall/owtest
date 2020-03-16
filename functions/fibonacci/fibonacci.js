function fib(n) {
	if(n > 1){
		return fib(n-1) + fib(n-2)
	} else {
		return n;
	}
}

function main() {
	var results = []
	for(var i=0; i<40; i++){
		results.push(fib(i));
	}
	return {payload: results.join(" ")};
}