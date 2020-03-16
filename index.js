import http from "k6/http";
import { sleep } from "k6";

const config = JSON.parse(open("./config.json"));

export let options = {
  vus: 10,
  duration: "2s"
};

export function setup() {
  console.log(config);
}

export default function() {
  const before = new Date().getTime();
  const T = 6; // time needed to complete a VU iteration

  console.log("Namespaces: " + config.namespaces);



  // Replace this with normal requests w/o a for-loop
  for (let i = 0; i < 10; i++) {
    http.get("http://test.loadimpact.com");
  }

  const after = new Date().getTime();
  const diff = (after - before) / 1000;
  const remainder = T - diff;
  if (remainder > 0) {
    sleep(remainder);
  } else {
    console.warn(
      `Timer exhausted! The execution time of the test took longer than ${T} seconds`
    );
  }
}