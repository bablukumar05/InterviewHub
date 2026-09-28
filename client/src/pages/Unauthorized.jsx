import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="h-8 w-8 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold">
          Access Denied
        </h1>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

      </div>
    </div>
  );
};

export default Unauthorized;
