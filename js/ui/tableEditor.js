(function (App) {
  function bindEditableCells(root = document) {
    root.addEventListener('click', e => {
      // 클릭된 요소 중에 editable인 요소 찾기
      const tdata = e.target.closest("div[data-editable='true']");
      // 수정 불가능한 영역이거나 이미 수정 중인 경우 return
      if (!tdata || tdata.classList.contains("editing")) return;
      // 수정 가능한 영역 클릭 시 수정 가능한 형태로 변경
      startEdit(tdata);
    });
  }

  const WIDTH_NUM = Object.freeze({
    short:  50,
    name:   70,
    day:    100,
    medium: 120,
    long:   200,
  });
  const COLUMNS_WIDTH = Object.freeze({
    group_name: WIDTH_NUM.name,
    group_memo: WIDTH_NUM.long,
    teacher_name: WIDTH_NUM.name,
    teacher_gender: WIDTH_NUM.short,
    teacher_state: WIDTH_NUM.short,
    teacher_memo: WIDTH_NUM.long,
    teacher_role: WIDTH_NUM.medium,
    teacher_subject: WIDTH_NUM.medium,
    
    day: WIDTH_NUM.day,
    start_time: WIDTH_NUM.medium,
    end_time: WIDTH_NUM.medium,

    student_name: WIDTH_NUM.name,
    student_gender: WIDTH_NUM.short,
    student_school: WIDTH_NUM.medium,
    student_grade: WIDTH_NUM.short,
    student_phone: WIDTH_NUM.long,
    student_parent: WIDTH_NUM.short,
    student_parent_phone: WIDTH_NUM.long,
    student_state: WIDTH_NUM.short,
    student_memo: WIDTH_NUM.long,

    changed_at:   WIDTH_NUM.day,
    date:         95,
    exam_score:   WIDTH_NUM.long,
    lesson:       WIDTH_NUM.long,
    homework:     WIDTH_NUM.long,
    exam:         WIDTH_NUM.long,
    notice:       WIDTH_NUM.long,
    content:      WIDTH_NUM.long,
    schedules:    WIDTH_NUM.long,

    log_table_name: WIDTH_NUM.long,
    log_action: WIDTH_NUM.medium,
    log_changed_field: WIDTH_NUM.long,
    log_before_value: WIDTH_NUM.long,
    log_after_value: WIDTH_NUM.long,
    log_date: WIDTH_NUM.long,

    plan_date: WIDTH_NUM.day,
    plan_memo: WIDTH_NUM.long,
    plan_lesson: WIDTH_NUM.long,
    plan_homework: WIDTH_NUM.long,
    plan_exam: WIDTH_NUM.medium,
    plan_notice: WIDTH_NUM.long,

    prev_homework: WIDTH_NUM.medium,
    record_lesson: WIDTH_NUM.medium,
    record_homework: WIDTH_NUM.medium,
    record_exam: WIDTH_NUM.medium,
    record_notice: WIDTH_NUM.medium,
    attendance: WIDTH_NUM.medium,
    homework_score: WIDTH_NUM.medium,
    exam_score: WIDTH_NUM.medium,
    record_memo: WIDTH_NUM.medium,
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
    const table = document.createElement("div");
    table.className = "table";
    // if (options.size == "fit") {
    //   table.style.width = "auto";
    // } else if (options.size == "full") {
    //   table.style.width = "100%";
    // }

    let html = '';
    // 요소가 하나도 없을 때
    if (list.length === 0) {
      html += `
        <div class="thead"><div class="row">
          <div class="th" style="width: 500px"></div>
        </div></div>
        <div class="tbody"><div class="row">
          <div class="tdata empty" style="width: 500px">
            <div class="td-text">요소가 하나도 없습니다.</div>
          </div>
        </div></div>`;
    }
    else {
      /* HEADER */
      const columns = options.columns || Object.keys(list.find(e => e !== undefined));
      html += `<div class="thead"><div class="row">`;
      columns.forEach(col => {
        const def = App.db.getColumnDef(col);
        if (!def) return;

        html += `
          <div class="th"
            ${COLUMNS_WIDTH[col] ? `style="width: ${COLUMNS_WIDTH[col]}px; min-width: ${COLUMNS_WIDTH[col]}px"` : ''}>
            ${def.label}</div>`;
      });
      html += "</div></div>";

      /* BODY */
      html += "<div class='tbody'>";
      
      list.forEach(row => {
        if(!row) return;
        html += `<div class="row">`;

        // 데이터 tdata
        columns.forEach(col => {
          const def = App.db.getColumnDef(col);
          if (!def) return;

          const actualValue = row[col];
          let displayValue = App.utils.text.formatDisplayValue(col, actualValue, row[def.source.placeholder]);
          
          html += `
            <div
              class="tdata"
              data-table="${def.source.table}"
              data-col="${def.source.column}"
              data-id="${row[def.source.idField]}"
              data-editable="${def.editable}"
              data-key="${col}"
              tabindex="0"
              data-value="${actualValue ?? ""}"
              ${COLUMNS_WIDTH[col] ? `style="width: ${COLUMNS_WIDTH[col]}px; min-width: ${COLUMNS_WIDTH[col]}px"` : ''}>
              <div class="td-text">${displayValue}</div></div>`;
        });
        html += `<div class="row-menu-button" onclick="openContextMenu(event)">⋮</div>`;
        html += "</div>"; // div.row
      });
      html += `</div>`; //div.tbody
    }
    
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
  function createEditor(key, rawValue) {
    const { editor, options } = App.db.getColumnDef(key).source;
    console.log(editor, options, rawValue);

    if (editor == "schedules") {
      return;
    }
    if (editor == "textarea") {
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

    if (editor == "select") {
      const select = document.createElement("select");

      options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        if (option.value == rawValue) option.selected = true;
        select.appendChild(option);
      });

      return select;
    }
    
    // number / date / default(text)
    const input = document.createElement("input");
    input.type = editor ?? "text";
    input.value = rawValue ?? "";

    
    input.addEventListener("focus", (e) => {
      // 입력된 값이 없을 때, 오늘 날짜로 초기화
      if (editor == "date" && !e.target.value) {
        e.target.value = App.utils.date.getTodayDate();
      }
      e.target.select();
    });

    return input;
  }

  /**
   * editable한 객체를 클릭했을 때 실행.
   * 클린한 객체를 수정 가능한 input 객체로 바꾼다.
   * @param {HTMLElement} tdata 
   */
  function startEdit(tdata) {
    const displayValue = tdata.innerText;
    const col = tdata.dataset.col;
    const id = tdata.dataset.id;
    const table = tdata.dataset.table;
    const key = tdata.dataset.key;

    tdata.classList.add("editing");

    const editor = createEditor(key, tdata.dataset.value);

    tdata.innerHTML = "";
    tdata.append(editor);
    editor.focus();

    editor.addEventListener("keydown", e => {
      if (e.target.tagName === "TEXTAREA") {
        if ((e.key === "Enter" && e.metaKey) || (e.key === "Enter" && e.ctrlKey)) {
          e.preventDefault();
          finishEdit(tdata, displayValue, editor.value, table, col, id, key);
          return;
        }
      } else {
        if (e.key === "Enter") {
          e.preventDefault();
          finishEdit(tdata, displayValue, editor.value, table, col, id, key);
          return;
        }
      }
        
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit(tdata, displayValue);
        return;
      }
    });

    editor.addEventListener("blur", () => {
      finishEdit(tdata, displayValue, editor.value, table, col, id, key);
    });
  }

  /**
   * 수정을 마무리한다.
   * 값이 변했으면 DB 업데이트, 수정되지 않았다면 변화 없음.
   * @param {*} tdata 
   * @param {*} displayValue 편집 이전의 display 값
   * @param {*} newValue 새로 입력한 raw 값
   * @param {*} table 
   * @param {*} col 
   * @param {*} id 
   * @returns 
   */
  function finishEdit(tdata, displayValue, newValue, table, col, id, key) {
    console.log("finishEdit", displayValue, newValue, table, col, id, key);
    if(!tdata.classList.contains("editing")) return;
    tdata.classList.remove("editing");

    // 값의 변화가 있는 경우
    if (newValue !== tdata.dataset.value) {
      App.db.update(table, id, col, newValue);
      tdata.dataset.value = newValue;
      tdata.innerHTML = `<div class="td-text">${App.utils.text.formatDisplayValue(key, newValue)}</div>`;;
      return;
    }
    // 값의 변화가 없는 경우
    tdata.innerHTML = `<div class="td-text">${displayValue}</div>`;
  }

  /**
   * 수정 상태를 취소하고 이전 값으로 되돌린다.
   * @param {*} tdata 
   * @param {*} displayValue 편집 이전의 display 값
   * @returns 
   */
  function cancelEdit(tdata, displayValue) {
    if(!tdata.classList.contains("editing")) return;
    tdata.classList.remove("editing");
    tdata.innerHTML = `<div class="td-text">${displayValue}</div>`;
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
      App.ui.group.updateSchedule({
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
      if (!confirm(App.utils.constants.DB_MESSAGE.confirmDelete)) return;
      App.ui.group.deleteSchedule(schedule.id);
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


  /* CONTEXT MENU */

  /** @type {HTMLElement | null} */
  let currentRow = null; // 선택된 행 객체

  function createContextMenu() {
    const menusInfo = [
      { action: "add-below", label: "아래에 추가" },
      { action: "delete", label: "삭제" },
    ];

    // 메뉴창 생성
    const contextMenu = document.createElement("div");
    contextMenu.id = "contextMenu";
    let html = '';
    menusInfo.forEach(menu => {
      html += `<div class="menu-item" data-action="${menu.action}">${menu.label}</div>`
    })
    contextMenu.innerHTML = html;

    // 우클릭 되었을 때 메뉴 띄우기
    document.addEventListener("contextmenu", openContextMenu);

    // 메뉴 클릭 동작
    contextMenu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action || !currentRow) return;

      if (action === "delete") {
        const { table, id } = currentRow.dataset;
        if (confirm("삭제할까요?")) {
          DB.deleteRow(table, id);
          currentRow.remove();
        }
      }
      hideContextMenu();
    });
    // document.body.append(menuButton);
    document.body.append(contextMenu);

    // 메뉴 닫기
    document.addEventListener("click", hideContextMenu);
    document.addEventListener("scroll", hideContextMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hideContextMenu();
      }
    });
  }

  function openContextMenu(e) {
    const row = e.target.closest("div.row");
    if (!row || !row.dataset.id) return;

    e.preventDefault();  // default context 나오지 않도록 하기
    e.stopPropagation(); // document 클릭으로 hideContextMenu 실행 방지 
    hideContextMenu();   // 다른 곳에 이미 메뉴가 띄워져 있는 경우

    currentRow = row;
    row.classList.add("selected");

    const menu = document.getElementById("contextMenu");

    // 스크롤 막기
    document.addEventListener("wheel", preventScroll, { passive: false });

    // 1. 일단 보이게 (크기 측정용)
    menu.style.display = "block";
    menu.style.visibility = "hidden";

    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = e.pageX;
    let y = e.pageY;

    // 2. 오른쪽으로 넘칠 경우 → 왼쪽으로
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 8;
    }

    // 3. 아래로 넘칠 경우 → 위쪽으로
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 8;
    }

    // 4. 최종 위치 적용
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    menu.style.visibility = "visible";
  }

  function hideContextMenu() {
    if (!currentRow) return;
    document.getElementById("contextMenu").style.display = "none";
    currentRow.classList.remove("selected");
    currentRow = null;

    // 스크롤 복구
    document.removeEventListener("wheel", preventScroll);
  }

  function preventScroll(e) {
    e.preventDefault();
  }

  App.ui.tableEditor = {
    bind: bindEditableCells,
    objectListToTable,
  };
})(window.App);
