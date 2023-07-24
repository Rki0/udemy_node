const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>My First Page</title></head>");
    res.write(
      "<body><form action='/message' method='POST'><input type='text' name='message' /><button type='submit'>Submit</button></form></body>"
    );
    res.write("</html>");
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    const body = [];

    // on은 이벤트를 들을 수 있다.
    req.on("data", (chunk) => {
      console.log(chunk);
      // 요청에 대한 모든 data를 얻을 때까지 이를 반복한다.
      body.push(chunk);
    });

    return req.on("end", () => {
      // chunk를 받은 후 이를 다루기 위해서는 버스 정류장같은 장소에서 상호 작용을 해야하는데, 그게 Buffer
      const parsedBody = Buffer.concat(body).toString(); // 현재 들어오는 데이터가 문자열이니까 toString을 통해 문자열로 변환해줌. 파일이라면 또 다른 처리를 해줘야하곘지?

      // 이제 처리할 수 있다.

      console.log(parsedBody);

      const message = parsedBody.split("=")[1];
      // fs.writeFileSync("message.txt", message); // writeFile 메서드에 sync가 붙어있기 때문에 파일이 생성될 때까지 코드 실행을 멈춘다.
      // // 따라서
      // // 이 아래 코드보다 if 밖 코드가 먼저 실행되므로 cannot send header 에러가 발생함.
      // // 이를 막기 위해서 req.on 앞에 return을 써준다.
      fs.writeFile("message.txt", message, (err) => {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }

  // console.log(req.url, req.method, req.headers);
  // node.js는 Event Loop를 가지고 있기 때문에 event listener가 등록되어 사라지지 않았다면 계속해서 동작한다.
  // process.exit(); // event loop를 끊을 수 있다. 그럼 앱이 종료된다.

  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>My First Page</title></head>");
  res.write("<body><h1>Hello</h1></body>");
  res.write("</html>");
  res.end(); // res를 입력하고 끝났다고 end로 알려주자. 이 이후로 코드를 작성하면 에러가 발생한다. 클라이언트로 두 번 전송하던 에러!!
};

// module은 전역 객체이기 때문에 Node.js 내 어디에서든 활용 가능하다.
// 어디서든 require로 routes.js를 불러오면 requestHandler를 불러올 수 있다는 뜻.
// module.exports = {
//   handler: requestHandler,
//   someText: "Some hard coded text",
// };
// module.exports.handler = requestHandler;
// module.exports.someText = "Some hard coded text";
exports.handler = requestHandler;
exports.someText = "Some hard coded text";
