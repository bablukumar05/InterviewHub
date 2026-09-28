const DashboardHeader = ({
  title,
  actions,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h1>

      {actions && (
        <div className="flex flex-wrap gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
