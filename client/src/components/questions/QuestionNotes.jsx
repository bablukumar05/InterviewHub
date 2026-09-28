import FormTextarea from "../forms/FormTextarea";

const QuestionNotes = ({
  value = "",
  onChange,
  error,
}) => {
  return (
    <FormTextarea
      label="Interviewer Notes"
      value={value}
      onChange={onChange}
      error={error}
      rows={4}
      placeholder="Record your notes about the candidate's response..."
    />
  );
};

export default QuestionNotes;
