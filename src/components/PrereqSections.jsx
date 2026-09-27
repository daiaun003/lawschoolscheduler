// JD Priority badge plus Required / Helpful prerequisite lists for a course.
// Renders nothing when the course has no prerequisite info.
export default function PrereqSections({ prereqs }) {
  const { required, recommended, jdPriority } = prereqs

  return (
    <>
      {jdPriority && (
        <div className="prereq-jd-row">
          <span className="prereq-jd">JD Priority</span>
        </div>
      )}

      {required.length > 0 && (
        <div className="prereq-section">
          <h3 className="modal-subhead">Required</h3>
          <ul className="prereq-list">
            {required.map((item, i) => (
              <li key={i} className="prereq-item prereq-required">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {recommended.length > 0 && (
        <div className="prereq-section">
          <h3 className="modal-subhead">Helpful, not required</h3>
          <ul className="prereq-list">
            {recommended.map((item, i) => (
              <li key={i} className="prereq-item prereq-recommended">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export const hasPrereqs = ({ required, recommended, jdPriority }) =>
  required.length > 0 || recommended.length > 0 || jdPriority
