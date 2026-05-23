import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function useAtlas() {
  const [clusters, setClusters] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const cSnap = await getDocs(collection(db, "clusters"));
      const tSnap = await getDocs(collection(db, "terms"));

      const clustersData = cSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.num.localeCompare(b.num));

      setClusters(clustersData);
      setTerms(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetch();
  }, []);

  return { clusters, terms, loading };
}
