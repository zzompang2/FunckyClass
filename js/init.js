/* GLOBAL 변수 */
const DB_STORAGE_KEY = "funckyClassDB";
let SQL = null;

/* sql.js 초기화 */
initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
}).then(function (sql) {
  console.log("SQL 초기화 완료")
  SQL = sql;

  startApp();
});

async function startApp() {
  console.log("startApp: 앱 시작중");
  const loaded = await DB.loadDB();

  if (!loaded) {
    await DB.createNewDB();
  }
}