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
const displayFunction = {
  year: formatGradeFromYear,
};

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

  console.log(year, nowYear, age);
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
 * 객체 배열을 table로 변환.
 * 객체의 keys가 컬럼이 된다.
 * @param {string} title
 * @param {Object[]} list
 * @param {{
 *   title?: string,
 *   columns?: string[],
 *   button?: HTMLElement,
 *   closed?: boolean,
 * }} options
 * @returns {HTMLElement} <table> HTML
 */
function objectListToTable(list, options = {}) {
  if (!Array.isArray(list)) return;

  // table container 생성
  const container = document.createElement("div");
  container.classList.add("table-container");

  // 타이틀 생성
  const title = document.createElement("div");
  title.className = "table-title";

  // 토글 버튼 생성
  const toggleBtn = document.createElement("div");
  toggleBtn.innerText = "▼";
  toggleBtn.className = "toggle-button";

  // table 생성
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";
  const table = document.createElement("table");
  table.className = "full-size";

  // header
  const columns = options.columns || Object.keys(list[0]);
  let html = "<thead><tr>";
  columns.forEach(col => {
    html += `<th>${STRINGS.columns[col]}</th>`;
  });
  html += "</tr></thead>";

  // body
  html += "<tbody>";
  if (list.length === 0) {
    html += `<tr><td class="empty" colspan='${columns.length}'>요소가 하나도 없습니다.</td></tr>`;
  } else {
    list.forEach(row => {
      html += "<tr>";
      columns.forEach(col => {
        if (displayFunction[col])
          html += `<td>${displayFunction[col](row[col])}</td>`;
        else
          html += `<td>${row[col] ?? "-"}</td>`;
      });
      html += "</tr>";
    });
  }
  html += `</tbody></table>`;
  
  table.innerHTML = html;

  // 토글 버튼 누르면 표 열기/닫기
  if (options.closed) {
    // 초기 상태 설정
    toggleBtn.classList.add("closed");
    wrapper.style.height = "0px";
  }
  toggleBtn.addEventListener("click", e => {
    const height = wrapper.scrollHeight;

    const closed = e.target.classList.toggle("closed");
    if (closed) {
      // 표 닫기
      wrapper.style.height = `${height}px`;
      requestAnimationFrame(() => {
        wrapper.style.height = "0px";
      });
    } else {
      // 표 열기
      wrapper.style.height = `${height}px`;
      wrapper.addEventListener("transitionend", function handler() {
        wrapper.style.height = "auto";
        wrapper.removeEventListener("transitionend", handler);
      });
    }
  });

  // 차례대로 내부 요소 넣기
  title.append(toggleBtn);
  if (options.title) title.append(options.title);
  if (options.button) title.append(options.button);
  container.append(title);

  wrapper.append(table);
  container.append(wrapper);

  return container;
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
    const div = e.target.closest("div[data-editable='true']");

    // 수정 불가능한 영역이거나 이미 수정 중인 경우 return
    if (!div || div.classList.contains("editing")) return;
    
    // 수정 가능한 영역 클릭 시 수정 가능한 형태로 변경
    startEdit(div);
  });
}