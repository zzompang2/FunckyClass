const displayFunction = {
  year: formatGradeFromYear,
  date: formatDateKorean,
};
const editorType = {
  row_id:     "number",
  group_id:   "number",
  plan_id:    "number",
  student_id: "number",
  day:        "number",
  year:       "number",
  exam_score: "number",
  start_time: "time",
  end_time:   "time",
  changed_at: "date",
  date:       "date",
  memo:       "textarea",
  lesson:     "textarea",
  homework:   "textarea",
  exam:       "textarea",
  notice:     "textarea",
  content:    "textarea",
  schedules:  "schedules",
};
const COLUMNS_WIDTH = Object.freeze({
  name:         60,
  teacher:      60,
  sub_teacher:  60,
  school:       65,
  year:         68,
  phone:        120,
  parent_phone: 120,
  parent:       50,
  memo:         200,
  day:          100,
  changed_at:   100,
  date:         95,
  subject:      120,
  sub_subject:  120,
  exam_score:   200,
  start_time:   200,
  end_time:     200,
  lesson:       200,
  homework:     200,
  exam:         200,
  notice:       200,
  content:      200,
  schedules:    200,
});

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
 *   editable?: boolean,
 *   tableName?: string,
 *   size?: "full" | "fit",
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

  /* table 생성 */
  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper no-scrollbar";
  const table = document.createElement("table");
  if (options.size == "fit") {
    table.style.width = "auto";
  } else if (options.size == "full") {
    table.style.width = "100%";
  }

  /* HEADER */
  const columns = options.columns || Object.keys(list[0]);
  const editable = Boolean(options.editable && options.tableName);
  let html = "<thead><tr>";
  columns.forEach(col => {
    html += `
      <th
        ${COLUMNS_WIDTH[col] ? `style="width: ${COLUMNS_WIDTH[col]}px; min-width: ${COLUMNS_WIDTH[col]}px"` : ''}>
        ${STRINGS.columns[col] ?? col}</th>`;
  });
  html += "</tr></thead>";

  /* BODY */
  html += "<tbody>";
  // 요소가 하나도 없을 때
  if (list.length === 0) {
    html += `
      <tr>
        <td class="empty" colspan='${columns.length}'>
          <div class="td-text">요소가 하나도 없습니다.</div>
        </td>
      </tr>`;
  } else {
    list.forEach(row => {
      html += `
      <tr data-table="${options.tableName ?? ''}" data-id="${row.id ?? ''}">
      `;

      // 데이터 td
      columns.forEach(col => {
        const actualValue = row[col];
        let displayValue;
        if (!actualValue)
          displayValue = "-"
        else if (displayFunction[col])
          displayValue = displayFunction[col](row[col]);
        else
          displayValue = actualValue;
        
        html += `
          <td
            data-col="${col}"
            data-editable="${editable}"
            tabindex="0"
            data-value="${actualValue ?? ""}"
            ${COLUMNS_WIDTH[col] ? `style="width: ${COLUMNS_WIDTH[col]}px; min-width: ${COLUMNS_WIDTH[col]}px"` : ''}>
            <div class="td-text">${displayValue}</div></td>`;
      });
      html += "</tr>";
    });
  }
  html += `</tbody>`;
  
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

/**
 * column에 알맞는 input 또는 textarea 객체를 만든다.
 * @param {string} col 
 * @param {*} rawValue 보여지는(display) 값이 아닌 실제 DB에 저장된 값
 * @returns {HTMLElement} input or textarea
 */
function createEditor(col, rawValue) {
  if (editorType[col] == "schedules") {
    return;
  }
  if (editorType[col] == "textarea") {
    const ta = document.createElement("textarea");
    ta.value = rawValue ?? "";
    ta.rows = 1;
    ta.style.width = "100%";
    ta.style.boxSizing = "border-box";
    ta.addEventListener('focus', (e) => {
      // 포커스 시 현재 내용에 맞춰 높이 조절
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    });
    ta.addEventListener('input', function() {
      // 입력할 때마다 텍스트에 맞춰 높이 조절
      this.style.height = 'auto';
      this.style.height = this.scrollHeight + 'px';
    });
    return ta;
  }
  
  // number / date / default(text)
  const input = document.createElement("input");
  input.type = editorType[col] ?? "text";
  input.value = rawValue ?? "";
  if (editorType[col] == "date") {
    input.addEventListener("focus", (e) => {
      // 입력된 값이 없을 때, 오늘 날짜로 초기화
      if (!e.target.value) {
        e.target.value = getTodayDate();
      }
    })
  }

  return input;
}

/**
 * editable한 객체를 클릭했을 때 실행.
 * 클린한 객체를 수정 가능한 input 객체로 바꾼다.
 * @param {HTMLElement} td 
 */
function startEdit(td) {
  const displayValue = td.innerText;
  const col = td.dataset.col;
  const tr = td.closest("tr");
  const id = tr.dataset.id;
  const table = tr.dataset.table;

  td.classList.add("editing");

  const editor = createEditor(col, td.dataset.value);

  td.innerHTML = "";
  td.append(editor);
  editor.focus();

  editor.addEventListener("keydown", e => {
    if (e.target.tagName === "TEXTAREA") {
      if ((e.key === "Enter" && e.metaKey) || (e.key === "Enter" && e.ctrlKey)) {
        e.preventDefault();
        finishEdit(td, displayValue, editor.value, table, col, id);
        return;
      }
    } else {
      if (e.key === "Enter") {
        e.preventDefault();
        finishEdit(td, displayValue, editor.value, table, col, id);
        return;
      }
    }
      
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit(td, displayValue);
      return;
    }
  });

  editor.addEventListener("blur", () => {
    finishEdit(td, displayValue, editor.value, table, col, id);
  });
}

/**
 * 수정을 마무리한다.
 * 값이 변했으면 DB 업데이트, 수정되지 않았다면 변화 없음.
 * @param {*} td 
 * @param {*} displayValue 편집 이전의 display 값
 * @param {*} newValue 새로 입력한 raw 값
 * @param {*} table 
 * @param {*} col 
 * @param {*} id 
 * @returns 
 */
function finishEdit(td, displayValue, newValue, table, col, id) {
  console.log("finishEdit", displayValue, newValue, table, col, id);
  if(!td.classList.contains("editing")) return;
  td.classList.remove("editing");

  // 값의 변화가 있는 경우
  if (newValue !== td.dataset.value) {
    DB.update(table, id, [col], [newValue]);
    td.dataset.value = newValue;
    if (displayFunction[col]) {
      td.innerHTML = `<div class="td-text">${displayFunction[col](newValue)}</div>`;
    } else {
      td.innerHTML = `<div class="td-text">${newValue}</div>`;;
    }
    return;
  }
  // 값의 변화가 없는 경우
  td.innerHTML = `<div class="td-text">${displayValue}</div>`;
}

/**
 * 수정 상태를 취소하고 이전 값으로 되돌린다.
 * @param {*} td 
 * @param {*} displayValue 편집 이전의 display 값
 * @returns 
 */
function cancelEdit(td, displayValue) {
  if(!td.classList.contains("editing")) return;
  td.classList.remove("editing");
  td.innerHTML = `<div class="td-text">${displayValue}</div>`;
}


/*******************/
/* SCHEDULE EDITOR */
/*******************/

/**
 * 그룹 info에서 수업 시간 수정할 수 있도록
 * input 객체들을 만든다.
 * @param {*} target 
 * @returns 
 */
function openScheduleEditor(target) {
  if (!target || target.classList.contains("editing")) return;
  
  target.classList.add("editing");

  // stringify한 스케줄 데이터를 다시 변환
  /** @type {Schedule} */
  const schedule = JSON.parse(target.dataset.value);
  
  const div = document.createElement("div");
  div.className = "hover-block";

  // 요일 선택 버튼
  const daySelector = document.createElement("div");
  daySelector.className = "schedule-weekday";
  daySelector.dataset.value = schedule.day;
  daySelector.innerHTML = [0,1,2,3,4,5,6].map(d =>
    `<button data-day="${d}" class="${d==schedule.day?'selected':''}">${"일월화수목금토"[d]}</button>`
  ).join("");
  div.append(daySelector);

  daySelector.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;

    daySelector.querySelectorAll("button").forEach(b =>
      b.classList.toggle("selected", b === btn)
    );
    daySelector.dataset.value = btn.dataset.day;
  });

  // 시작 시간 ~ 종료 시간
  const timeSelector = document.createElement("div");
  timeSelector.className = "schedule-time";
  const timeArr = schedule.start_time.split(":").concat(schedule.end_time.split(":"));
  timeSelector.innerHTML = `
      <input type="number" min="0" max="23" value="${timeArr[0]}"> :
      <input type="number" min="0" max="59" step="5" value="${timeArr[1]}"> ~
      <input type="number" min="0" max="23" value="${timeArr[2]}"> :
      <input type="number" min="0" max="59" step="5" value="${timeArr[3]}">
    `;
  div.append(timeSelector);

  const completeBtn = document.createElement("button");
  completeBtn.innerText = "완료";
  completeBtn.addEventListener("click", () => {
    const timeArr = Array.from(timeSelector.querySelectorAll("input"))
      .map(input => input.value);
    groupUI.updateSchedule({
      id:         schedule.id,
      group_id:   schedule.group_id,
      day:        Number(daySelector.dataset.value),
      start_time: `${("0"+timeArr[0]%24).slice(-2)}:${("0"+timeArr[1]%60).slice(-2)}`,
      end_time:   `${("0"+timeArr[2]%24).slice(-2)}:${("0"+timeArr[3]%60).slice(-2)}`,
    });
  });
  div.append(completeBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.innerText = "취소";
  cancelBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeScheduleEditor(target, schedule);
  });
  div.append(cancelBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "삭제";
  deleteBtn.addEventListener("click", () => {
    if (!confirm(STRINGS.db.confirmDelete)) return;
    groupUI.deleteSchedule(schedule.id);
  });
  div.append(deleteBtn);

  target.innerHTML = "";
  target.append(div);
  target.querySelector("input").select();
}

function closeScheduleEditor(target, schedule) {
  if (!target || !target.classList.contains("editing")) return;
  target.classList.remove("editing");
  
  target.innerHTML = `
    ${dayToText(schedule.day)} ${schedule.start_time}~${schedule.end_time}
  `;
}