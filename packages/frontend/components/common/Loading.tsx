import { CircularProgress } from "react-loading-indicators";
import "~~/styles/globals.css";

/**
 * Spinner Component
 * @returns
 */
const Loading = () => {
  return (
    <div className="loading content-center flex items-center justify-center">
      <CircularProgress variant="bubble-dotted" color="#316acc" size="large" text="wait..." textColor="green" />
    </div>
  );
};

export default Loading;
