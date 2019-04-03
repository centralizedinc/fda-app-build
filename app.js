const schedule = require("node-schedule");
const path = require("path");
const axios = require("axios");
var cmd = require("node-cmd");
var express = require("express");
var port = process.env.PORT || 5000;
var app = express();

app.get("/test", (req, res) => {
  res.sendStatus(200);
});

app.listen(port);

axios.defaults.baseURL = "https://api.travis-ci.org/repo/";
axios.defaults.headers.common["Authorization"] = process.env.TRAVIS_TOKEN;
axios.defaults.headers.common["Travis-API-Version"] = "3";
axios.defaults.headers.common["Content-Type"] = "application/json";

var config = {
  request: {
    branch: "master",
    config: {
      merge_mode: "merge",
      notifications: {
        email: [
          "markjhonpaul.quijom@gmail.com",
          "abalita@centralizedinc.com",
          "blitzkris24@gmail.com",
          "godofuri76@gmail.com",
          "fquiocho@centralizedinc.com",
          "venus.belo.rhi@gmail.com"
        ],
        on_success: "always"
      }
    }
  }
};

var count = 0;
var fs = require("fs");
var apps = [
  "fda-admin-portal",
  "fda-approver-portal",
  "fda-client-portal",
  "fda-encoder-portal"
];

console.log("DATE: " + new Date());

schedule.scheduleJob({
    hour: 0,
    minute: 0,
    dayOfWeek: [new schedule.Range(1, 5)]
  },
  () => {
    runBuild();
  }
);

function runBuild() {
  apps.forEach(app => {
    axios
      .get(
        "https://api.github.com/repos/centralizedinc/" +
        app +
        "/contents/package.json", {
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.GITHUB_TOKEN,
            Accept: "application/vnd.github.v3+json"
          }
        }
      )
      .then(result => {
        var sha = result.data.sha;
        fs.writeFile(
          path.resolve(__dirname, "./apps/" + app + "/package.json"),
          result.data.content, {
            encoding: "base64"
          },
          function (err) {
            cmd.get("npm run " + app, function (err, data, stderr) {
              console.log(data);
              axios
                .put(
                  "https://api.github.com/repos/centralizedinc/" +
                  app +
                  "/contents/package.json",

                  {
                    branch: "master",
                    message: "update version",
                    committer: {
                      name: "CCCI Inc.",
                      email: "abalita@centralizedinc.com"
                    },
                    content: fs
                      .readFileSync(
                        path.resolve(
                          __dirname,
                          "./apps/" + app + "/package.json"
                        )
                      )
                      .toString("base64"),
                    sha: sha
                  }, {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: process.env.GITHUB_TOKEN,
                      Accept: "application/vnd.github.v3+json"
                    }
                  }
                )
                .then(result => {
                  count++;
                  if (count == 3) {
                    axios
                      .post(
                        "centralizedinc%2Ffda-admin-portal/requests",
                        config
                      )
                      .then(result => {
                        console.log(
                          "####### ADMIN:" + JSON.stringify(result.data)
                        );
                        return axios.post(
                          "centralizedinc%2Ffda-approver-portal/requests",
                          config
                        );
                      })
                      .then(result => {
                        console.log(
                          "####### APPROVER:" + JSON.stringify(result.data)
                        );
                        return axios.post(
                          "centralizedinc%2Ffda-client-portal/requests",
                          config
                        );
                      })
                      .then(result => {
                        console.log(
                          "####### ENCODER:" + JSON.stringify(result.data)
                        );
                        return axios.post(
                          "centralizedinc%2Ffda-encoder-portal/requests",
                          config
                        );
                      })
                      .catch(err => {
                        console.log("ERROR: " + err);
                      });
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            });
          }
        );
      })
      .catch(err => {
        console.log(err);
      });
  });
}

app.get("/build", (req, res) => {
  runBuild();
  // res.sendStatus(200);
  res.send("Deploying applications as of " + new Date());
});

app.get("/timezone", (req, res) => {
  res.json({
    date: new Date(),
    timezone: new Date().toLocaleString()
  })
})