const schedule = require("node-schedule");
const axios = require("axios");
var cmd=require('node-cmd');

axios.defaults.baseURL = "https://api.travis-ci.org/repo/";
axios.defaults.headers.common["Authorization"] = "token VmpqBclkPp3WSz82L8Ammw";
axios.defaults.headers.common["Travis-API-Version"] = "3";
axios.defaults.headers.common["Content-Type"] = "application/json";

var config = {
  request: {
    branch: "master",
    config: {
      merge_mode: "merge",
      notifications: {
        on_success: "always"
      }
    }
  }
};

cmd.get('npm run patch-apps',function (err, data, stderr){
  console.log('data: ' + data)
  console.log('err: ' + err)
  console.log('stderr: ' + stderr)
  
})

// schedule.scheduleJob({ hour: 8, minute: [27], dayOfWeek: [new schedule.Range(0, 6)] },() => {
//     axios.post("centralizedinc%2Ffda-admin-portal/requests", config)
//       .then(result => {
//         console.log("####### ADMIN:" + JSON.stringify(result.data));
//         return axios.post("centralizedinc%2Ffda-approver-portal/requests", config)
//       })
//       .then(result => {
//         console.log("####### APPROVER:" + JSON.stringify(result.data));
//         return axios.post("centralizedinc%2Ffda-client-portal/requests", config)
//       })
//       .then(result => {
//         console.log("####### ENCODER:" + JSON.stringify(result.data));
//         return axios.post("centralizedinc%2Ffda-encoder-portal/requests", config)
//       })
//       .catch(err => {
//         console.log("ERROR: " + err);
//       });
//   }
// );
