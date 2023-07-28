const path = require("path");

// path.dirname은 경로의 디렉토리 이름을 회신한다.
// process.mainModule은 애플리케이션을 시작한 주요 모듈을 나타낸다. 즉, app.js에서 만든 모듈을 의미한다.
// filename을 통해 어떤 파일에서 이 모듈이 시작되었는지 알 수 있다.
// 즉, process.mainModule.filename은 우리 애플리케이션이 실행될 수 있도록 해주는 파일의 경로를 알려준다.
// module.exports = path.dirname(process.mainModule.filename); // mainModule은 deprecated됨
module.exports = path.dirname(require.main.filename);
