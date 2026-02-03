import { NoDataFound } from "@/components/noDataFound";
import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <NoDataFound
          title="404 - Page Not Found"
          description="The page you're looking for doesn't exist or has been moved. Please check the URL or return to the dashboard."
          buttonText="Go to Dashboard"
          buttonAction={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
};

export default NotFoundPage;