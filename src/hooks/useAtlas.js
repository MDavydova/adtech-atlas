import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function useAtlas() {
  const [clusters, setClusters] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      console.log("fetching...");
      try {
        const cSnap = await getDocs(collection(db, "clusters"));
        const tSnap = await getDocs(collection(db, "terms"));
        console.log("got clusters:", cSnap.size, "terms:", tSnap.size);

        const clustersData = cSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => a.num.localeCompare(b.num));

        setClusters(clustersData);
        setTerms(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        console.log("loading set to false");
      } catch (e) {
        console.error("fetch error:", e);
      }
    }
    fetch();
  }, []);

  return { clusters, terms, loading };
}
