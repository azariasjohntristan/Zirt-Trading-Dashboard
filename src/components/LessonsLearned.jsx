export default function LessonsLearned({ data }) {
  const lessons = data.lessons || [];

  return (
    <div className="card" data-card-id="lessons">
      <div className="card-title">Lessons Learned</div>
      {lessons.length > 0 ? (
        <div className="lesson-list">
          {lessons.map((l, i) => (
            <div key={i} className="lesson-item">
              <span className="lesson-num">{i + 1}</span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">No lessons yet.</div>
      )}
    </div>
  );
}
