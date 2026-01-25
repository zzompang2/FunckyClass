(function (App) {
  function getStudentScores(planId) {
    const [curPlan, prevPlan] = App.db.getCurAndPrevPlans(planId);
    console.log("현재 / 이전", curPlan, prevPlan);

    const students = App.db.getStudentsByGroup(curPlan.plan_group_id);
    const records = App.db.getStudentRecords(curPlan.plan_id);

    const map = [];

    records.forEach(record => {
      map[record.student_id] = {
        record_id: record.record_id,
        record_lesson: record.record_lesson,
        record_homework: record.record_homework,
        record_notice: record.record_notice,
        attendance: record.attendance,
        homework_score: record.homework_score,
        exam_score: record.exam_score,
        record_memo: record.record_memo,
      }
    });

    students.forEach(st => {
      if(
        App.utils.date.isEarlier(curPlan.plan_date, st.student_created_at) || 
        st.student_state !== "active"
      ) {
        map[st.student_id] = undefined;
        return;
      }

      if(!map[st.student_id]) {
        const record = App.db.addStudentRecord(curPlan.plan_id, st.student_id);
        map[st.student_id] = {
          record_id: record.id,
          record_lesson: record.lesson,
          record_homework: record.homework,
          record_notice: record.notice,
          attendance: record.attendance,
          homework_score: record.homework_score,
          exam_score: record.exam_score,
          record_memo: record.memo,
        }
      }

      map[st.student_id] = {
        student_id: st.student_id,
        student_name: st.student_name,
        ...map[st.student_id],
        prev_homework: prevPlan?.plan_homework || '첫수업',
        prev_exam: prevPlan?.plan_exam || '',
        plan_lesson: curPlan.plan_lesson,
        plan_homework: curPlan.plan_homework,
        plan_notice: curPlan.plan_notice,
      };
    });

    return map;
  }

  App.service.score = {
    getStudentScores,
  };
})(window.App);
