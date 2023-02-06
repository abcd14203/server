const express = require("express");
const app = express();
const port = 4000; // react의 기본값은 3000이니까 3000이 아닌 아무 수
const cors = require("cors");
const bodyParser = require("body-parser");
//const mysql = require("mysql"); // mysql 모듈 사용

const fastcsv = require("fast-csv");
const fs = require("fs");
const { Parser } = require("json2csv");

const connection = require("./config/db");
// const { connect } = require("./routes/user_inform");

// const corsOptions = {
//   origin: "http://localhost:4000",
//   credentials: true,
// };

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/loadAiPrediction", (req, res) => {
  // 1. child-process모듈의 spawn 취득
  const spawn = require("child_process").spawn;

  // 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행
  const result = spawn("python", ["./bitcoin.py"]);

  // 3. stdout의 'data'이벤트리스너로 실행결과를 받는다.
  result.stdout.on("data", function (data) {
    res.send(data.toString());
  });

  // 4. 에러 발생 시, stderr의 'data'이벤트리스너로 실행결과를 받는다.
  result.stderr.on("data", function (data) {
    res.send(data.toString());
  });
});

app.get("/userinfo", (req, res) => {
  // const sql = "SELECT * FROM heroku_c3b4550615fb803.users";
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });
});

app.get("/groupinfo", (req, res) => {
  const sql = "SELECT * FROM heroku_c3b4550615fb803.groups";

  connection.query(sql, (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });
});

app.get("/predictioninfo", (req, res) => {
  const sql = "SELECT * FROM heroku_c3b4550615fb803.prediction";
  connection.query(sql, (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });
});

app.get("/bitcoininfo", (req, res) => {
  const sql = "SELECT * FROM heroku_c3b4550615fb803.bitcoin_price";
  connection.query(sql, (err, results) => {
    if (err) {
      res.send(err);
    } else {
      res.send(results);
    }
  });
});

app.get("/register", (req, res) => {
  res.send("<h1>등록 페이지</h1>");
});

app.get("/login", (req, res) => {
  res.send("<h1>빠잉</h1>");
});

app.post("/register", (req, res) => {
  const body = req.body;
  connection.query("SELECT COUNT(*) FROM users", (err, result) => {
    if (result) {
      const id = result[0]["COUNT(*)"] + 1;
      const groupNum = parseInt(result[0]["COUNT(*)"] / 4) + 1;

      connection.query(
        "INSERT INTO users (id, email, password, group_num) VALUES (?, ?, ?, ?)",
        [id, body.email, body.password, groupNum],
        (err, result) => {
          if (result) {
            connection.query(
              "INSERT INTO prediction (user_id, group_id) VALUES (?, ?)",
              [id, groupNum]
            );

            connection.query(
              "SELECT group_size FROM heroku_c3b4550615fb803.groups WHERE group_id = ?",
              [groupNum],
              (err, result) => {
                if (result) {
                  let group_size = result[0]["group_size"] + 1;
                  connection.query(
                    "UPDATE heroku_c3b4550615fb803.groups SET group_size = ? WHERE group_id = ?",
                    [group_size, groupNum]
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  connection.query(
    "SELECT u.id, u.email, g.group_type FROM heroku_c3b4550615fb803.users AS u JOIN heroku_c3b4550615fb803.groups AS g ON u.group_num = g.group_id WHERE u.email=? AND u.password=?",
    [email, password],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        res.send(result);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/survey", (req, res) => {
  const body = req.body;
  connection.query(
    "UPDATE heroku_c3b4550615fb803.users SET age = ?, gender = ?, degree = ?, eduBackground = ?, major1 = ?, major2 = ?, major3 = ?, work_experience = ? WHERE id = ?",
    [
      body.age,
      body.gender,
      body.degree,
      body.eduBackground,
      body.major1,
      body.major2,
      body.major3,
      body.workExperience,
      body.id,
    ]
  );
});

app.post("/survey2", (req, res) => {
  const body = req.body;
  connection.query(
    "UPDATE heroku_c3b4550615fb803.users SET before_survey1 = ?, before_survey2 = ?, before_survey3 = ?, before_survey4 = ?, before_survey5 = ?, before_survey6 = ?, before_survey7 = ?, before_survey8 = ?, before_survey9 = ? WHERE id = ?",
    [
      body.beforeSurvey1,
      body.beforeSurvey2,
      body.beforeSurvey3,
      body.beforeSurvey4,
      body.beforeSurvey5,
      body.beforeSurvey6,
      body.beforeSurvey7,
      body.beforeSurvey8,
      body.beforeSurvey9,
      body.id,
    ]
  );
});

app.post("/survey3", (req, res) => {
  const body = req.body;
  connection.query(
    "UPDATE heroku_c3b4550615fb803.users SET after_survey1 = ?, after_survey2 = ?, after_survey3 = ?, after_survey4 = ?, after_survey5 = ?, after_survey6 = ?, after_survey7 = ?, after_survey8 = ? WHERE id = ?",
    [
      body.afterSurvey1,
      body.afterSurvey2,
      body.afterSurvey3,
      body.afterSurvey4,
      body.afterSurvey5,
      body.afterSurvey6,
      body.afterSurvey7,
      body.afterSurvey8,
      body.id,
    ]
  );
});

app.post("/findpassword", (req, res) => {
  const body = req.body;
  connection.query(
    "SELECT password from heroku_c3b4550615fb803.users WHERE email = ?",
    [body.email],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        res.send(result);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/coinandcash", (req, res) => {
  const body = req.body;
  connection.query(
    "SELECT group_num from heroku_c3b4550615fb803.users WHERE id = ?",
    [body.id],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        connection.query(
          "SELECT num_of_coins, amount_of_cash from heroku_c3b4550615fb803.groups WHERE group_id = ?",
          [result[0]["group_num"]],
          (err, result) => {
            if (err) {
              res.send({ err: err });
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/membersdecision", (req, res) => {
  const body = req.body;
  let col_name = `init_price_${body.test_num}`;
  connection.query(
    "SELECT group_num from heroku_c3b4550615fb803.users WHERE id = ?",
    [body.id],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        connection.query(
          `SELECT user_id, ${col_name} from heroku_c3b4550615fb803.prediction WHERE group_id = ?`,
          [result[0]["group_num"]],
          (err, result) => {
            if (err) {
              res.send({ err: err });
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/suggestion", (req, res) => {
  const body = req.body;
  connection.query(
    `SELECT ${body.aiPredColumn} from heroku_c3b4550615fb803.groups WHERE group_type = ?`,
    [body.groupType],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        res.send(result);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/initialPrice", (req, res) => {
  const body = req.body;
  let init_price_name = `init_price_${body.test_num}`;
  let init_dec_time_name = `init_dec_time_${body.test_num}`;
  let init_group_mean_name = `init_group_mean_${body.test_num}`;
  connection.query(
    `UPDATE heroku_c3b4550615fb803.prediction SET ${init_price_name} = ?, ${init_dec_time_name} = ? WHERE user_id = ?`,
    [body.initialPrice, body.predTime, body.id],
    (err, result) => {
      if (result) {
        connection.query(
          "SELECT group_num FROM heroku_c3b4550615fb803.users WHERE id = ?",
          [body.id],
          (err, result) => {
            if (result) {
              let groupNum = result[0]["group_num"];
              connection.query(
                `SELECT ${init_price_name} FROM heroku_c3b4550615fb803.prediction WHERE group_id = ?`,
                [groupNum],
                (err, result) => {
                  if (result) {
                    let mean_of_group = 0;
                    let total = result.length;
                    for (let i = 0; i < result.length; i++) {
                      if (result[i][init_price_name] != 0) {
                        mean_of_group += result[i][init_price_name];
                      } else {
                        total -= 1;
                      }
                    }
                    mean_of_group /= total;
                    connection.query(
                      `UPDATE heroku_c3b4550615fb803.groups SET ${init_group_mean_name} = ? WHERE group_id = ?`,
                      [mean_of_group, groupNum],
                      (err, result) => {
                        if (err) {
                          res.send({ err: err });
                        } else {
                          res.send({ result: result });
                        }
                      }
                    );
                  } else {
                    console.log(err);
                  }
                }
              );
            } else {
              console.log(err);
            }
          }
        );
      }
    }
  );
});

app.post("/whetherToChange", (req, res) => {
  const body = req.body;
  let whether_to_change_name = `whether_to_change_${body.test_num}`;
  let second_dec_time_name = `second_dec_time_${body.test_num}`;

  connection.query(
    `UPDATE heroku_c3b4550615fb803.prediction SET ${whether_to_change_name} = ?, ${second_dec_time_name} = ? WHERE user_id = ?`,
    [body.whetherToChange, body.predTime, Number(body.id)]
  );
});

app.post("/finalPrice", (req, res) => {
  const body = req.body;

  let final_price_name = `final_price_${body.test_num}`;
  let final_dec_time_name = `final_dec_time_${body.test_num}`;
  let final_group_mean_name = `final_group_mean_${body.test_num}`;

  connection.query(
    `UPDATE heroku_c3b4550615fb803.prediction SET ${final_price_name} = ?, ${final_dec_time_name} = ? WHERE user_id = ?`,
    [body.finalPrice, body.predTime, body.id],
    (err, result) => {
      if (result) {
        connection.query(
          "SELECT group_num FROM heroku_c3b4550615fb803.users WHERE id = ?",
          [body.id],
          (err, result) => {
            if (result) {
              let groupNum = result[0]["group_num"];
              connection.query(
                `SELECT ${final_price_name} FROM heroku_c3b4550615fb803.prediction WHERE group_id = ?`,
                [groupNum],
                (err, result) => {
                  if (result) {
                    let mean_of_group = 0;
                    let total = result.length;
                    for (let i = 0; i < result.length; i++) {
                      if (result[i][final_price_name] != 0) {
                        mean_of_group += result[i][final_price_name];
                      } else {
                        total -= 1;
                      }
                    }
                    mean_of_group /= total;
                    connection.query(
                      `UPDATE heroku_c3b4550615fb803.groups SET ${final_group_mean_name} = ? WHERE group_id = ?`,
                      [mean_of_group, groupNum],
                      (err, result) => {
                        if (err) {
                          res.send({ err: err });
                        } else {
                          res.send({ result: result });
                        }
                      }
                    );
                  } else {
                    console.log(err);
                  }
                }
              );
            } else {
              console.log(err);
            }
          }
        );
      }
    }
  );
});

app.post("/perfinf", (req, res) => {
  const body = req.body;

  let init_price_col_name = `init_price_${body.test_num}`;
  let whether_to_change_col_name = `whether_to_change_${body.test_num}`;
  let final_price_col_name = `final_price_${body.test_num}`;

  connection.query(
    "SELECT group_num from heroku_c3b4550615fb803.users WHERE id = ?",
    [body.id],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else {
        connection.query(
          `SELECT user_id, ${init_price_col_name}, ${whether_to_change_col_name}, ${final_price_col_name} from heroku_c3b4550615fb803.prediction WHERE group_id = ?`,
          [result[0]["group_num"]],
          (err, result) => {
            if (err) {
              res.send({ err: err });
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/fakeAi", (req, res) => {
  const body = req.body;

  connection.query(
    "SELECT group_num FROM heroku_c3b4550615fb803.users WHERE id = ?",
    [body.id],
    (err, result) => {
      if (result) {
        let groupNum = result[0]["group_num"];
        connection.query(
          `SELECT ${body.meanColumn} FROM heroku_c3b4550615fb803.groups WHERE group_id = ?`,
          [groupNum],
          (err, result) => {
            if (result) {
              res.send(result);
            } else {
              res.send({ err: err });
            }
          }
        );
      } else {
        res.send({ err: err });
      }
    }
  );
});

//
//
// admin
//
//
app.post("/adminlogin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  connection.query(
    "SELECT id, idadmin, passwordadmin FROM heroku_c3b4550615fb803.admin WHERE idadmin=? AND passwordadmin=?",
    [email, password],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        res.send(result);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/userinfo", (req, res) => {
  connection.query(
    "SELECT * FROM heroku_c3b4550615fb803.users",
    (err, users) => {
      if (err) {
        res.send({ err: err });
      }
      if (users.length > 0) {
        const jsonData = JSON.parse(JSON.stringify(users));
        res.send(jsonData);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/groupinfo", (req, res) => {
  connection.query(
    "SELECT * FROM heroku_c3b4550615fb803.groups",
    (err, users) => {
      if (err) {
        res.send({ err: err });
      }
      if (users.length > 0) {
        const jsonData = JSON.parse(JSON.stringify(users));
        res.send(jsonData);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/predictioninfo", (req, res) => {
  connection.query(
    "SELECT * FROM heroku_c3b4550615fb803.prediction",
    (err, users) => {
      if (err) {
        res.send({ err: err });
      }
      if (users.length > 0) {
        const jsonData = JSON.parse(JSON.stringify(users));
        res.send(jsonData);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/bitcoininfo", (req, res) => {
  connection.query(
    "SELECT * FROM heroku_c3b4550615fb803.bitcoin_price",
    (err, users) => {
      if (err) {
        res.send({ err: err });
      }
      if (users.length > 0) {
        const jsonData = JSON.parse(JSON.stringify(users));
        res.send(jsonData);
      } else {
        res.status(404).send({ message: "실패" });
      }
    }
  );
});

app.post("/loadAiPrediction", (req, res) => {
  // 1. child-process모듈의 spawn 취득
  const spawn = require("child_process").spawn;

  // 2. spawn을 통해 "python 파이썬파일.py" 명령어 실행
  const result = spawn("python", ["./bitcoin.py"]);

  // 3. stdout의 'data'이벤트리스너로 실행결과를 받는다.
  result.stdout.on("data", function (data) {
    res.send(data.toString());
  });

  // 4. 에러 발생 시, stderr의 'data'이벤트리스너로 실행결과를 받는다.
  result.stderr.on("data", function (data) {
    res.send(data.toString());
  });
});

app.listen(process.env.PORT || 4000, "0.0.0.0", () => {
  console.log("Server is running.");
});
