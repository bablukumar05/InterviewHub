import FormTextarea from "../forms/FormTextarea";

const StrengthsInput = ({
  value = "",
  onChange,
  error,
}) => {
  return (
    <FormTextarea
      label="Candidate Strengths"
      value={value}
      onChange={onChange}
      error={error}
      rows={5}
      placeholder="What did the candidate do well?"
    />
  );
};

export default StrengthsInput;
