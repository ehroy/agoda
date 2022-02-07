const fetch = require("node-fetch");
const fs = require("fs-extra");
const readline = require("readline-sync");
const cheerio = require("cheerio");

const keyCaptcha = "";
var password = `Kaserinas123`;

const randstr = (length) =>
  new Promise((resolve, reject) => {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    resolve(text);
  });

const generateIndoName = () =>
  new Promise((resolve, reject) => {
    fetch("https://swappery.site/data.php?qty=1", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
const functionGetTokenAction = (sitekey) =>
  new Promise((resolve, reject) => {
    fetch(
      `http://2captcha.com/in.php?key=${keyCaptcha}&method=userrecaptcha&version=v2&action=action&min_score=0.3
    &googlekey=${sitekey}&pageurl=https://www.agoda.com/id-id/signup?targeturl=%2Fid-id%2F`,
      {
        method: "get",
      }
    )
      .then((res) => res.text())
      .then((text) => {
        resolve(text);
      })
      .catch((err) => reject(err));
  });

const functionGetRealTokenAction = (id) =>
  new Promise((resolve, reject) => {
    fetch(
      `http://2captcha.com/res.php?key=${keyCaptcha}&action=get&json=1&id=${id}`,
      {
        method: "get",
      }
    )
      .then((res) => res.json())
      .then((text) => {
        resolve(text);
      })
      .catch((err) => reject(err));
  });

const functionRegist = (resCaptcha, email, name) =>
  new Promise((resolve, reject) => {
    const bodys = {
      credentials: {
        username: email,
        password: password,
        authType: "email",
      },
      firstName: name,
      lastName: name,
      newsLetter: true,
      captchaVerifyInfo: {
        captchaType: "recaptcha",
        captchaResult: {
          recaptchaToken: resCaptcha,
        },
      },
    };

    fetch("https://www.agoda.com/ul/api/v1/signup", {
      method: "POST",
      body: JSON.stringify(bodys),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Host: "www.agoda.com",
        Origin: "https://www.agoda.com",
        "UL-App-Id": "mspa",
        "UL-Fallback-Origin": "https://www.agoda.com",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Mobile Safari/537.36",
      },
    })
      .then(async (res) => {
        const $ = cheerio.load(await res.text());
        const result = res.headers.raw()["set-cookie"];

        resolve(result);
      })
      .catch((err) => reject(err));
  });

const functionClaimApk = (token) =>
  new Promise((resolve, reject) => {
    fetch(
      "https://www.agoda.com/app/agodacashcampaign?campaignToken=8a126505ef0fcf80769338910e5579f9e19c4b20&refreshOnBack&view=nativeapp",
      {
        redirect: "manual",
        headers: {
          Cookie: `token=${token};`,
        },
      }
    )
      .then((res) => res.text())
      .then((result) => {
        resolve(result);
      })
      .catch((err) => reject(err));
  });

const functionClaimWeb = (token) =>
  new Promise((resolve, reject) => {
    fetch(
      "https://www.agoda.com/id-id/app/agodacashcampaign?campaignToken=b6ee49c1fc6734aa0eae8b75014cbd3032b1fea3&refreshOnBack=",
      {
        redirect: "manual",
        headers: {
          Cookie: `token=${token};`,
        },
      }
    )
      .then((res) => res.text())
      .then((result) => {
        resolve(result);
      })
      .catch((err) => reject(err));
  });
function a(index) {
  (async () => {
    for (var i = 0; i < 1; i++) {
      try {
        const indoName = await generateIndoName();
        const rand = await randstr(4);
        const { result } = indoName;
        const name =
          result[0].firstname.toLowerCase() +
          result[0].lastname.toLowerCase() +
          rand;
        const email = `${name}}@ptsuroyya.my.id`.toLowerCase();

        //   console.log(`Mencoba mendapatkan captcha | ${email}`);

        const linkAccess = "https://www.agoda.com/";
        const actionToken = await functionGetTokenAction(
          "6LfGHMcZAAAAAAN-k_ejZXRAdcFwT3J-KK6EnzBE"
        );
        const requestId = actionToken.split("|")[1];
        console.log("[+] waiting Solved Capctha Anjay");
        let resultActionToken = {
          request: "",
        };
        do {
          resultActionToken = await functionGetRealTokenAction(requestId);
          // console.log(resultActionToken);
        } while (resultActionToken.request === "CAPCHA_NOT_READY");

        const theRealActionToken = resultActionToken.request;
        // console.log("[+] Captcha Terbypass");
        const regist = await functionRegist(theRealActionToken, email, name);
        //   console.log(regist);
        if (regist[0].includes("token")) {
          //   console.log("[+] Regist berhasil");

          const token = regist[0].split(";")[0].split("ul.token=")[1];
          const claimApk = await functionClaimApk(token);

          if (claimApk) {
            // console.log("[+] Claim apk sukses");

            const claimWeb = await functionClaimWeb(token);
            if (claimWeb) {
              console.log("[+] Sukses Claim All Rp 144,113");

              await fs.appendFile(
                "resultAgoda.txt",
                `${email}|${password}` + "\r\n",
                (err) => {
                  if (err) throw err;
                }
              );
            } else {
              console.log("[!] Claim web gagal\n");
            }
          } else {
            console.log("[!] Claim apk gagal\n");
          }
        } else {
          console.log("[!] Regist gagal\n");
        }
      } catch (e) {
        console.log("[!] Ada Yang Error ");
      }
    }
  })();
}
(async () => {
  //   console.log(
  //     chalk.yellow(figlet.textSync("Agoda Mazze", { horizontalLayout: "fitted" }))
  //   );
  console.log(`
            ==========================================================
            ============== AUTO CRETAE CLIAM X @ CAPTCHA =============
            ==========================================================`);
  var jumlahbrowser = readline.question("Jumlah akun : ");
  var hh = parseFloat(jumlahbrowser) - 1;
  for (let index = 0; index < jumlahbrowser; index++) {
    a(index);
  }
})();
