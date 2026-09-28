import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  ClipboardList,
  CalendarDays,
  FileText,
  ScrollText,
  UserRound,
  Search,
} from "lucide-react";

export const navigationConfig = {
  ADMIN: [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      label: "Jobs",
      path: "/admin/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Interviews",
      path: "/admin/interviews",
      icon: CalendarDays,
    },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: ScrollText,
    },
  ],

  RECRUITER: [
    {
      label: "Dashboard",
      path: "/recruiter",
      icon: LayoutDashboard,
    },
    {
      label: "Jobs",
      path: "/recruiter/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Applications",
      path: "/recruiter/applications",
      icon: ClipboardList,
    },
    {
      label: "Interviews",
      path: "/recruiter/interviews",
      icon: CalendarDays,
    },
  ],

  INTERVIEWER: [
    {
      label: "Workspace",
      path: "/interviewer/workspace",
      icon: LayoutDashboard,
    },
    {
      label: "My Interviews",
      path: "/interviewer/interviews",
      icon: CalendarDays,
    },
    {
      label: "Question Bank",
      path: "/interviewer/questions",
      icon: ClipboardList,
    },
  ],

  CANDIDATE: [
    {
      label: "Dashboard",
      path: "/candidate",
      icon: LayoutDashboard,
    },
    {
      label: "Browse Jobs",
      path: "/candidate/jobs",
      icon: Search,
    },
    {
      label: "My Applications",
      path: "/candidate/applications",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Interviews",
      path: "/candidate/interviews",
      icon: CalendarDays,
    },
    {
      label: "My Offers",
      path: "/candidate/offers",
      icon: FileText,
    },
    {
      label: "My Profile",
      path: "/candidate/profile",
      icon: UserRound,
    },
  ],
};
