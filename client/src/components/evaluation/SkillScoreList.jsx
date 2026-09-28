import SkillScoreInput from "./SkillScoreInput";

const SkillScoreList = ({
  skills = [],
  values = {},
  onChange,
  errors = {},
}) => {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {skills.map((skill) => {
        const skillName =
          typeof skill === "string"
            ? skill
            : skill.name;

        return (
          <SkillScoreInput
            key={skillName}
            skill={skillName}
            value={values[skillName] || ""}
            onChange={(score) =>
              onChange?.(
                skillName,
                score
              )
            }
            error={
              errors[skillName]
            }
          />
        );
      })}
    </div>
  );
};

export default SkillScoreList;
