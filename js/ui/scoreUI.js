(function (App) {
  const tableToShow = ["date", "lesson", "homework", "exam", "notice", "memo"];

  function renderScoreTab(area) {
    // 계획 목록 (날짜 선택용)
    const plans = App.db.getPlansByGroup(App.state.currentGroupId);
    area.innerHTML = '';

    if (plans.length === 0) {
      area.innerHTML = '등록된 계획이 없습니다.';
      return;
    }

    /* 날짜 선택기 */
    let html = `
      <label>날짜 선택</label>
        <select id="scoreDateSelect">`;

    plans.forEach(p => {
      html += `
        <option value="${p.plan_id}">
          ${App.utils.text.truncate(`${App.utils.date.formatDateKorean(p.plan_date)}: ${p.plan_lesson}`)}
        </option>`;
    });

    html += `
      </select>
      <div id="scoreTableCtn"></div>
    `;

    area.innerHTML = html;

    const selector = document.getElementById("scoreDateSelect");
    selector.addEventListener("change", e => {
      loadScoresByDate(e.target.value);
    });

    // 초기값: 오늘 혹은 가장 가까운 과거 계획
    const upcomingPlan = plans.find(p => App.utils.date.isEarlier(p.plan_date, App.utils.date.getTodayDate(1)));
    if (upcomingPlan) selector.value = upcomingPlan.plan_id;
    else selector.value = plans[0];
    loadScoresByDate(selector.value);
  }

  function loadScoresByDate(planId) {
    const container = document.getElementById("scoreTableCtn");
    container.innerHTML = '';

    const studentScores = App.service.score.getStudentScores(planId);
    container.append(App.ui.tableEditor.objectListToTable(studentScores, {
      columns: [
        "student_name", "record_memo", "attendance", "record_lesson", "prev_homework",
        "homework_score", "record_exam", "exam_score", "record_homework",
        "record_notice", "record_feedback",
      ]
    }));
  }

  App.ui.score = {
    renderScoreTab,
  };
})(window.App);