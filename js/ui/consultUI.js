(function (App) {
  let selectedName;

  /**
   * 수업 계획 표를 만들어 area 객체 내에 넣는다.
   * @param {HTMLElement} area 
   */
  function renderTab(area) {
    /* 학생 RADIO */
    const students = App.db.getStudentsByGroup(App.state.currentGroupId);
    let html = `
      <div id="radioCtn" class="student-radio-ctn">
        <div class="radio-item">
          <div id="radioDefault" class="name selected" data-value="0">전체</div>
        </div>
    `;

    students.forEach(st => {
      html += `
        <div class="radio-item">
        <div class="name" data-value="${st.student_id}">${st.student_name}</div>
        <div class="button" data-value="${st.student_id}">🞡</div>
        </div>
      `;
    });
    html += `
      </div>
      <div id="consultList"></div>
    `;

    area.innerHTML = '';
    area.innerHTML = html;

    /* 디폴트 라디오 버튼 */
    selectedName = document.getElementById("radioDefault");

    /* 클릭 이벤트 */
    const radioCtn = document.getElementById("radioCtn");
    radioCtn.addEventListener('click', (e) => {
      console.log(e.target, e.target.dataset.value)
      if (e.target.classList.contains('button')) {
        addConsult(e.target.dataset.value);
        return;
      }
      if (e.target.classList.contains('name')) {
        drawTable(e.target.dataset.value);
        selectedName.classList.remove("selected");
        e.target.classList.add("selected");
        selectedName = e.target;
        return;
      }
    });

    /* CONSULT 리스트 */
    drawTable();
  }

  function drawTable(_studentId = 0) {
    const studentId = Number(_studentId);
    let consults;
    
    if (studentId === 0)
      consults = App.db.getConsultsByGroup(App.state.currentGroupId);
    else
      consults = App.db.getConsultsByStudent(studentId);
    
    // 학생 이름 띄우고 수정 불가능하도록 키값 이름 변경:
    // student_name --> consult_student_name
    consults = consults.map(co => {
      const { consult_date, student_name, ...rest } = co;
      return { consult_date, consult_student_name: student_name, ...rest };
    });

    const consultList = document.getElementById("consultList");
    consultList.innerHTML = '';
    consultList.append(
      App.ui.tableEditor.objectListToTable(consults, {
        title: "상담 내용",
      })
    );
  }

  function addConsult(studentId) {
    App.db.addConsult(studentId);
    App.db.saveDB();
    drawTable(selectedName.dataset.value);
  }

  App.ui.consult = {
    renderTab,
  };
})(window.App);