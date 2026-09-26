import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { numericRiderDestination } from "./numericRiderRedirect.js";

export default function useNumericRiderRedirect(riderId, fullName) {
  const location = useLocation();
  const navigate = useNavigate();
  const destination = numericRiderDestination(location, riderId, fullName);
  useEffect(() => {
    if (destination) navigate(destination, { replace: true });
  }, [destination, navigate]);
}
