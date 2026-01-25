(function (App) {
  let students = [];
  let records = [];
  let selectedPlanId = 0;
  let selectedStudentId = 0;

  function renderTab(area) {
    const plans = App.db.getPlansByGroup(App.state.currentGroupId);
    students = App.db.getStudentsByGroup(App.state.currentGroupId);

    area.innerHTML = '';

    if (plans.length === 0) {
      area.innerHTML = '등록된 계획이 없습니다.';
      return;
    }

    /* 날짜 선택기 */
    let html = `
      <div class="date-picker">
        <div class="label">날짜 선택</div>
        <select id="scoreDateSelect">`;

    plans.forEach(p => {
      html += `
        <option value="${p.plan_id}">
          ${App.utils.text.truncate(`${App.utils.date.formatDateKorean(p.plan_date)}: ${p.plan_lesson}`, 50)}
        </option>`;
    });

    html += `
        </select>
      </div>
      <div class="message-ctn">
        <div class="student-list-ctn">
          <div class="title">학생 목록</div>
          <div id="studentList"></div>
        </div>
        <div class="content-ctn">
          <div class="title">학생 목록</div>
          <div id="msgContent"></div>
          <div id="warningMsg"></div>
        </div>
      </div>
    `;

    area.innerHTML = html;

    const selector = document.getElementById("scoreDateSelect");
    selector.addEventListener("change", e => {
      selectedPlanId = e.target.value;
      loadStudents();
    });

    // 초기값: 오늘 혹은 가장 가까운 과거 계획
    const upcomingPlan = plans.find(p => App.utils.date.isEarlier(p.plan_date, App.utils.date.getTodayDate(1)));
    if (upcomingPlan) selector.value = upcomingPlan.plan_id;
    else selector.value = plans[0];
    selectedPlanId = selector.value;
    loadStudents();
  }

  function loadStudents() {
    records = App.db.getStudentRecords(selectedPlanId);
    
    const studentList = document.getElementById("studentList");
    studentList.innerHTML = '';

    students.forEach(st => {
      const inactive = !(records.find(re => re.student_id === st.student_id));
      const button = document.createElement("button");
      button.innerText = st.student_name;
      button.addEventListener("click", e => {
        e.target.classList.add('clicked');
        loadMessage(st.student_id);
      });
      if (inactive) {
        button.classList.add('inactive');
        button.disabled = true;
      }
      studentList.append(button);
    });
  }

  function loadMessage(studentId) {
    if (!selectedPlanId || !studentId) return;

    const msgContent = document.getElementById("msgContent");
    const warningMsg = document.getElementById("warningMsg");

    const student = App.db.getStudent(studentId);
    const plan = App.db.getPlan(selectedPlanId);
    const group = App.db.getGroup(plan.plan_group_id);
    const record = App.db.getStudentRecord(selectedPlanId, studentId);

    const date = App.utils.text.formatDisplayValue('plan_date', plan.plan_date);
    const attendance = App.utils.text.formatDisplayValue(record.attendance);
    const homeworkScore = record.attendance === 'absent' ? '결석으로 미확인' : record.homework_score + '%';
    const lesson = record.record_lesson || plan.plan_lesson;
    const homework = record.record_homework || plan.plan_homework;
    const exam = record.record_exam || plan.plan_exam;
    const feedback = record.record_feedback;
    const notice = record.record_notice || plan.plan_notice;
    const message = 
    `[SSEM학원 ${group.group_name} ${date} 수업안내]\n`
    + `학생: ${student.student_name}\n`
    + `출결: ${attendance}\n`
    + `과제: ${homeworkScore}`
    + `${lesson   ? `\n\n▶ 수업내용\n${lesson}` : ''}`
    + `${homework ? `\n\n▶ 오늘의 과제\n${homework}` : ''}`
    + `${exam     ? `\n\n▶ 테스트\n-단원: ${exam}\n-점수: ${record.exam_score}점` : ''}`
    + `${feedback ? `\n\n▶ 개별피드백\n${feedback}` : ''}`;
    + `${notice ? `\n\n▶ 공지사항\n${notice}` : ''}`;
    const warning = [];
    if (!date) warning.push('날짜');
    if (!attendance) warning.push('출결');
    if (!homeworkScore) warning.push('과제 점수');
    if (!lesson) warning.push('수업 내용');
    if (!homework) warning.push('과제');
    if (!exam) warning.push('테스트');
    if (!feedback) warning.push('피드백');
    if (!notice) warning.push('공지사항');

    msgContent.innerText = message;
    warningMsg.innerText = `비어있는 값(${warning.length}): ${warning.join(' / ')}`;
    App.utils.text.copyToClipboard(message);
  }

  App.ui.message = {
    renderTab,
  };
})(window.App);