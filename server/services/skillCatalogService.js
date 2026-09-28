const { DEPARTMENTS, CAREER_ROLES, SKILL_ALIASES } = require('../constants/careerFields');

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeSkill = (rawSkill) => {
  if (!rawSkill || typeof rawSkill !== 'string') {
    return '';
  }

  const cleaned = rawSkill.trim().toLowerCase();
  if (!cleaned) {
    return '';
  }

  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  const stripped = cleaned.replace(/[\.\-_]/g, '');
  if (SKILL_ALIASES[stripped]) {
    return SKILL_ALIASES[stripped];
  }

  return rawSkill
    .trim()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');
};

const normalizeSkillList = (skills) => {
  if (!skills) return [];

  let skillArray = [];
  if (Array.isArray(skills)) {
    skillArray = skills;
  } else if (typeof skills === 'string') {
    skillArray = skills.split(',').map((s) => s.trim());
  }

  const seen = new Set();
  const normalized = [];

  for (const item of skillArray) {
    const canonical = normalizeSkill(item);
    if (!canonical) continue;

    const lower = canonical.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      normalized.push(canonical);
    }
  }

  return normalized;
};

const isSkillMatch = (skillA, skillB) => {
  const canonicalA = normalizeSkill(skillA).toLowerCase();
  const canonicalB = normalizeSkill(skillB).toLowerCase();
  return Boolean(canonicalA && canonicalB && canonicalA === canonicalB);
};

const getDepartments = async () => {
  const departmentList = Object.entries(DEPARTMENTS).map(([key, name]) => {
    const roles = CAREER_ROLES.filter((r) => r.department === name);
    return {
      key,
      name,
      rolesCount: roles.length,
      roles: roles.map((r) => ({ id: r.id, name: r.name, field: r.field })),
    };
  });

  return departmentList;
};

const getCatalog = async ({ department, search, field } = {}) => {
  let roles = [...CAREER_ROLES];

  if (department) {
    const deptLower = department.trim().toLowerCase();
    roles = roles.filter(
      (r) =>
        r.department.toLowerCase().includes(deptLower) ||
        r.department.toLowerCase().replace(/[^a-z0-9]/g, '').includes(deptLower.replace(/[^a-z0-9]/g, ''))
    );
  }

  if (field) {
    const fieldLower = field.trim().toLowerCase();
    roles = roles.filter((r) => r.field.toLowerCase().includes(fieldLower));
  }

  if (search) {
    const term = search.trim().toLowerCase();
    roles = roles.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(term);
      const descMatch = r.description.toLowerCase().includes(term);
      const skillMatch =
        r.requiredSkills.some((s) => s.toLowerCase().includes(term)) ||
        r.recommendedSkills.some((s) => s.toLowerCase().includes(term));
      return nameMatch || descMatch || skillMatch;
    });
  }

  return roles;
};

const getRoleById = async (roleId) => {
  if (!roleId || typeof roleId !== 'string') {
    throw createError('Please provide a valid role ID', 400);
  }

  const cleanId = roleId.trim().toLowerCase();
  const role = CAREER_ROLES.find(
    (r) => r.id.toLowerCase() === cleanId || r.name.toLowerCase().replace(/\s+/g, '-') === cleanId
  );

  if (!role) {
    throw createError(`Career role with ID "${roleId}" not found in catalog`, 404);
  }

  return role;
};

const searchRoles = async (query = '') => {
  if (!query || !query.trim()) {
    return {
      roles: CAREER_ROLES.slice(0, 5),
      matchedSkills: [],
    };
  }

  const term = query.trim().toLowerCase();
  const matchedRoles = CAREER_ROLES.filter((r) => {
    return (
      r.name.toLowerCase().includes(term) ||
      r.department.toLowerCase().includes(term) ||
      r.field.toLowerCase().includes(term) ||
      r.requiredSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  const matchedSkills = Object.values(SKILL_ALIASES)
    .filter((skill, index, self) => self.indexOf(skill) === index)
    .filter((skill) => skill.toLowerCase().includes(term))
    .slice(0, 10);

  return {
    totalRoles: matchedRoles.length,
    roles: matchedRoles,
    matchedSkills,
  };
};

module.exports = {
  normalizeSkill,
  normalizeSkillList,
  isSkillMatch,
  getDepartments,
  getCatalog,
  getRoleById,
  searchRoles,
};
