import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { client } from "../utils/utils";
import type { IMasterData } from "@/types/types";

// 👉 Context type
type MasterDataContextType = {
  masterData: IMasterData;
  masterDataLoading: boolean;
  masterDataError: string | null;
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

      if (res?.data?.data) {
        setMasterData(res.data.data);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch master data";
      console.error("Master data fetch failed:", error);
      setMasterDataError(errorMessage);
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
