import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { client } from "../utils/utils";
import { getApiErrorMessage } from "./api-error";
import type { IMasterData } from "@/types/types";

// 👉 Context type
type MasterDataContextType = {
  masterData: IMasterData;
  masterDataLoading: boolean;
  masterDataError: string | null;
  // Retry for the error state ServiceLayout renders — without it a failed
  // bootstrap request meant empty dropdowns until a full page reload.
  refetchMasterData: () => Promise<void>;
};

// 👉 Create context
const MasterDataContext = createContext<MasterDataContextType | undefined>(
  undefined,
);

// 👉 Provider props
type MasterDataProviderProps = {
  children: ReactNode;
};

const MasterDataProvider = ({ children }: MasterDataProviderProps) => {
  const [masterData, setMasterData] = useState<IMasterData>({
    levels: [],
    backgrounds: [],
    subjects: [],
    chapters: [],
    topics: [],
    records: [],
    collections: [],
  });
  const [masterDataLoading, setMasterDataLoading] = useState(true);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);

  // ✅ FETCH MASTER DATA
  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true);
      setMasterDataError(null);
      const res = await client.get("/master-data");

      // Keep-both-paths: check the envelope, not just `data.data` — an error
      // body used to be stored as if it were master data.
      if (res?.data?.success && res?.data?.data) {
        setMasterData(res.data.data);
      } else {
        setMasterDataError(
          res?.data?.message || "Failed to fetch master data.",
        );
      }
    } catch (error) {
      // getApiErrorMessage distinguishes "could not reach the server" from a
      // server-side failure; the raw axios message reads "Request failed with
      // status code 500" and helps nobody.
      setMasterDataError(getApiErrorMessage(error, "Failed to fetch master data."));
      console.error("Master data fetch failed:", error);
    } finally {
      setMasterDataLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  return (
    <MasterDataContext.Provider
      value={{
        masterData,
        masterDataLoading,
        masterDataError,
        refetchMasterData: fetchMasterData,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
};

// ✅ Custom hook
const useMasterData = (): MasterDataContextType => {
  const context = useContext(MasterDataContext);

  if (!context) {
    throw new Error("useMasterData must be used within MasterDataProvider");
  }

  return context;
};

export { MasterDataProvider, useMasterData };
