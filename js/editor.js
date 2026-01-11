const displayFunction = {
  year: formatGradeFromYear,
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
  const editable = Boolean(options.editable && options.tableName);
  html += "<tbody>";
  if (list.length === 0) {
    html += `<tr><td class="empty" colspan='${columns.length}'>요소가 하나도 없습니다.</td></tr>`;
  } else {
    list.forEach(row => {
      html += `
        <tr data-table="${options.tableName ?? ''}" data-id="${row.id ?? ''}">
      `;
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
            data-value="${actualValue ?? ""}">${displayValue}</td>`;
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
    ta.rows = 4;
    ta.style.width = "100%";
    ta.style.boxSizing = "border-box";
    return ta;
  }
  
  // number / date / default(text)
  const input = document.createElement("input");
  input.type = editorType[col] ?? "text";
  input.value = rawValue ?? "";
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
      td.innerText = displayFunction[col](newValue);
    } else {
      td.innerText = newValue;
    }
    return;
  }
  // 값의 변화가 없는 경우
  td.innerText = displayValue;
}

/**
 * 수정 상태를 취소하고 이전 값으로 되돌린다.
 * @param {*} td 
 * @param {*} displayValue 편집 이전의 display 값
 * @returns 
 */
function cancelEdit(td, displayValue) {
  console.log("cancelEdit");
  if(!td.classList.contains("editing")) return;
  td.classList.remove("editing");
  td.innerText = displayValue;
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
  
  const tr = document.createElement("tr");
  tr.className = "hover-block";

  // 요일 선택 버튼
  const daySelector = document.createElement("div");
  daySelector.className = "schedule-weekday";
  daySelector.dataset.value = schedule.day;
  daySelector.innerHTML = [0,1,2,3,4,5,6].map(d =>
    `<button data-day="${d}" class="${d==schedule.day?'selected':''}">${"일월화수목금토"[d]}</button>`
  ).join("");
  tr.append(daySelector);

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
  tr.append(timeSelector);

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
  tr.append(completeBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "삭제";
  deleteBtn.addEventListener("click", () => {
    if (!confirm(STRINGS.db.confirmDelete)) return;
    groupUI.deleteSchedule(schedule.id);
  });
  tr.append(deleteBtn);

  target.innerHTML = "";
  target.append(tr);
  target.querySelector("input").focus();

  tr.addEventListener("keydown", e => {
    console.log(e.target);
    // if (e.target.tagName === "TEXTAREA") {
    //   if ((e.key === "Enter" && e.metaKey) || (e.key === "Enter" && e.ctrlKey)) {
    //     e.preventDefault();
    //     finishEdit(td, displayValue, editor.value, table, col, id);
    //     return;
    //   }
    // } else {
    //   if (e.key === "Enter") {
    //     e.preventDefault();
    //     finishEdit(td, displayValue, editor.value, table, col, id);
    //     return;
    //   }
    // }
      
    // if (e.key === "Escape") {
    //   e.preventDefault();
    //   cancelEdit(td, displayValue);
    //   return;
    // }
  });

  tr.addEventListener("blur", () => {
    finishEdit(td, displayValue, editor.value, table, col, id);
  });
}