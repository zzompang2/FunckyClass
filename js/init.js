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

/**
 * 태어난 년도를 학년으로 변경한다.
 * @param {number} year 
 * @returns {string} 학년
 */
function formatGradeFromYear(year) {
  const nowYear = new Date().getFullYear();
  const age = nowYear - year + 1;

  if (8 <= age && age < 14)
    return `초${age - 7} (${age})`;
  else if (14 <= age && age < 17)
    return `중${age - 13} (${age})`;
  else if (17 <= age && age <20)
    return `고${age - 16} (${age})`;
  else
    return `${age}세`;
}

/**
 * YYYY-MM-DD 형태의 날짜 문자열을 MM/DD(week) 형태로 반환.
 * @param {string} dateStr 
 * @returns 
 */
function formatDateKorean(dateStr) {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const thisYear = new Date().getFullYear();
  let year = d.getFullYear();
  if (thisYear == year) {
    year = "";
  } else {
    year = year % 100 + "/";
  }
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  const week = "일월화수목금토"[d.getDay()];

  return `${year}${month}/${day}(${week})`;
}

/**
 * 오늘 날짜를 문자열 형태로 반환.
 * @returns {string} 오늘 날짜로 "YYYY-MM-DD"
 */
function getTodayDate() {
  let date = new Date();
  
  let year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1
  let day = ("0" + date.getDate()).slice(-2);
  return year + "-" + month + "-" + day;
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

  /* 데이터 수정 기능 추가 */
  document.addEventListener("click", e => {
    // 클릭된 요소 중에 editable인 요소 찾기
    const tdata = e.target.closest("div[data-editable='true']");

    // 수정 불가능한 영역이거나 이미 수정 중인 경우 return
    if (!tdata || tdata.classList.contains("editing")) return;
    
    // 수정 가능한 영역 클릭 시 수정 가능한 형태로 변경
    startEdit(tdata);
  });
}