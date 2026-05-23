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
