/**
 * init.js
 * 
 * 광역으로 쓰이는 변수 및 함수들.
 * 프로그램 실행시 최초로 UI를 구성하는 함수들.
 */

/********************/
/* GLOBAL VARIABLES */
/********************/

const DB_STORAGE_KEY = "funckyClassDB";
const MENU_CONFIG = Object.freeze({
  timetable:  { label: "시간표" },
  calender:   { label: "달력/todo" },
  diary:      { label: "다이어리" },
  db:         { label: "데이터베이스" },
});
const TAB_CONFIG = Object.freeze({
  info:     { label: "정보" },
  students: { label: "학생" },
  plans:    { label: "계획" },
  scores:   { label: "과제/성적" },
  message:  { label: "문자" },
  consult:  { label: "상담" },
});

let SQL = null;
let currentGroupId = 0;
let currentTab = "info";


/*******************/
/* GLOBAL FUNCTION */
/*******************/

function dayToText(day) {
  return "일월화수목금토"[day];
}


/*************/
/* APP START */
/*************/

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

  sidebarUI.loadGroups();
  sidebarUI.loadLocalbar();
}