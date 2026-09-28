import FormTextarea from "../forms/FormTextarea";

const WeaknessesInput = ({
  value = "",
  onChange,
  error,
}) => {
  return (
    <FormTextarea
      label="Areas for Improvement"
      value={value}
      onChange={onChange}
      error={error}
      rows={5}
      placeholder="What areas need improvement?"
    />
  );
};

export default WeaknessesInput;
