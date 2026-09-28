import FormTextarea from "../forms/FormTextarea";

const FeedbackTextarea = ({
  label = "Overall Feedback",
  value = "",
  onChange,
  error,
  placeholder = "Write detailed feedback about the candidate...",
}) => {
  return (
    <FormTextarea
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      rows={6}
      placeholder={placeholder}
    />
  );
};

export default FeedbackTextarea;
