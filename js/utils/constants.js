(function (App) {
  App.utils.constants = {
    DB_STORAGE_KEY: "funckyClassDB",

    MENU_CONFIG: Object.freeze({
      timetable:  { label: "시간표" },
      calender:   { label: "달력/todo" },
      diary:      { label: "다이어리" },
      db:         { label: "데이터베이스" },
    }),
    
    TAB_CONFIG: Object.freeze({
      info:     { label: "정보" },
      plans:    { label: "계획" },
      scores:   { label: "과제/성적" },
      message:  { label: "문자" },
      consult:  { label: "상담" },
    }),
  };
})(window.App);
