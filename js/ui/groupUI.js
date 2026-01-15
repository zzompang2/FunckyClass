window.groupUI = (function () {
  function selectGroup(id, name) {
    currentGroupId = id;
    document.getElementById("selected-group").textContent = name;

    sidebarUI.loadGroups(); // 선택된 그룹 표시
    openTab();
  }

  /**
   * 반 정보, 수정내역, 학생 명단을 만들어 area 객체 내에 넣는다.
   * @param {HTMLElement} area 
   */
  function renderGroupInfoTab(area) {
    /** @type {[Group, Schedule[]]} */
    const [group, schedules] = DB.getGroupById(currentGroupId);

    let html = `
      <div id="groupInfoCtn" style="display: flex; flex-wrap: wrap">
      <div class="table-container">
      <div class="table-title">
        반 정보
        <button onclick="groupUI.addSchedule(${currentGroupId})">시간 추가</button>
      </div>
      <div class="table-wrapper">
      <div class="table">
        <div class="tbody">
          <div class="row hover-block" data-table="groups" data-id="${group.id}">
            <div class="th" style="width: 64px">반 이름</div>
            <div
              class="tdata"
              data-col="name"
              data-editable="true"
              tabindex="0"
              data-value="${group.name ?? ''}"
              style="width: ${COLUMNS_WIDTH["name"]}px">
              <div class="td-text">${group.name}</div>
            </div>
            <div class="th" style="width: 90px">수업시간</div>
            <div class="schdule-td" style="width: 120px">
              ${schedules.map(sc => `
              <div
                class="schedule-row"
                onclick="openScheduleEditor(this)"
                tabindex="0"
                data-value='${JSON.stringify(sc)}'>
                ${dayToText(sc.day)} ${sc.start_time}~${sc.end_time}
              </div>
              `).join('')}
            </div>
          </div>
          <div class="row hover-block" data-table="groups" data-id="${group.id}">
            <div class="th" style="width: 64px">담임</div>
            <div
              class="tdata"
              data-col="teacher"
              data-editable="true"
              tabindex="0"
              data-value="${group.teacher ?? ''}"
              style="width: ${COLUMNS_WIDTH['teacher']}px">
              <div class="td-text">${group.teacher}</div>
            </div>
            <div class="th" style="width: 90px">담임 과목</div>
            <div
              class="tdata"
              data-col="subject"
              data-editable="true"
              tabindex="0"
              data-value="${group.subject ?? ''}"
              style="width: ${COLUMNS_WIDTH['subject']}px">
              <div class="td-text">${group.subject}</div>
            </div>
          </div>
          <div class="row hover-block" data-table="groups" data-id="${group.id}">
            <div class="th" style="width: 64px">부담임</div>
            <div
              class="tdata"
              data-col="sub_teacher"
              data-editable="true"
              tabindex="0"
              data-value="${group.sub_teacher ?? ''}"
              style="width: ${COLUMNS_WIDTH['sub_teacher']}px">
              <div class="td-text">${group.sub_teacher}</div>
            </div>
            <div class="th" style="width: 90px">부담임 과목</div>
            <div
              class="tdata"
              data-col="sub_subject"
              data-editable="true"
              tabindex="0"
              data-value="${group.sub_subject ?? ''}"
              style="width: ${COLUMNS_WIDTH['sub_subject']}px">
              <div class="td-text">${group.sub_subject}</div>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div></div></div>
    `;

    area.innerHTML = html;

    // 수정 내역(history) 테이블
    /** @type {HistoryType[]} */
    const history = DB.getHistoryByGroup(currentGroupId);
    const historyCols = ["changed_at"].concat(Object.keys(Schema.DB_COLUMNS.groups));

    const historyTable = objectListToTable(groupingHistoryByDate(history), {
      title: "수정 내역",
      columns: historyCols,
      closed: true,
      editable: false,
    });
    
    // 학생 명단
    const students = DB.getStudentsByGroup(currentGroupId);
    const studentCols = ["name", "school", "year", "phone", "parent", "parent_phone", "memo"];
    const addStudentBtn = document.createElement("button");
    addStudentBtn.innerText = "학생 추가";
    addStudentBtn.addEventListener("click", () => addStudent());
    
    const studentTable = objectListToTable(students, {
      title: "학생 목록",
      columns: studentCols,
      button: addStudentBtn,
      editable: true,
      tableName: "students",
    });
    
    document.getElementById("groupInfoCtn").append(historyTable);
    area.append(studentTable);
  }

  /**
   * history 객체 배열을 같은 날짜끼리 하나의 객체로 만들고
   * 그 배열을 반환한다.
   * @param {HistoryType[]} historyList 
   * @return {Object[]}
   */
  function groupingHistoryByDate(historyList) {
    // 같은 날짜의 수정 내역들을 하나의 객체로 만들기
    const map = {};
    historyList.forEach(({ changed_at, field, old_value, new_value }) => {
      map[changed_at] ??= {changed_at};
      map[changed_at][field] = new_value;
    });
    return Object.values(map);
  }

  /**
   * student 데이터를 DB에 추가하고 reload
   */
  function addStudent() {
    DB.addStudent(currentGroupId);
    DB.saveDB();
    openTab("info"); // 갱신
  }

  function addSchedule() {
    DB.addSchedule(currentGroupId);
    openTab("info"); // 갱신
  }

  function deleteSchedule(id) {
    DB.deleteSchedule(id);
    openTab("info"); // 갱신
  }

  function updateSchedule(schedule) {
    DB.update(
      "group_schedules", schedule.id,
      Object.keys(schedule), Object.values(schedule)
    );
    openTab("info"); // 갱신
  }

  return {
    selectGroup,
    renderGroupInfoTab,
    addStudent,
    addSchedule,
    deleteSchedule,
    updateSchedule,
  };
})();