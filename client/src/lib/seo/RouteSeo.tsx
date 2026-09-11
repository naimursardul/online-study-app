import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { resolveSeo } from "./seo-routes";
import { applySeoHead } from "./seo-head";

/*
 * Mounted ONCE in App.tsx, immediately inside <BrowserRouter>. Not per-page:
 *
 * 1. Pages under ServiceLayout are behind the masterDataLoading gate — a
 *    page-level writer would produce a late title on exactly the routes that
 *    most need one.
 * 2. React runs child effects before parent effects, so mixing an ancestor
 *    writer with page-level overrides races on tree depth.
 * 3. ProtectedRoute renders <Navigate to="/login">, which a location-driven
 *    writer follows automatically while a page-level one never mounts.
 *
 * resolveSeo is pure pathname work — no master data, no fetches — so the
 * title is correct before any data request resolves.
 */
export default function RouteSeo() {
  const location = useLocation();
  const seo = useMemo(() => resolveSeo(location.pathname), [location.pathname]);

  useEffect(() => {
    applySeoHead(seo);
  }, [seo]);

  return null;
}
