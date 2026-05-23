import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function useAtlas() {
  const [clusters, setClusters] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const cSnap = await getDocs(
        query(collection(db, "clusters"), orderBy("num")),
      );
      const tSnap = await getDocs(collection(db, "terms"));
      setClusters(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTerms(tSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetch();
  }, []);

  return { clusters, terms, loading };
}
