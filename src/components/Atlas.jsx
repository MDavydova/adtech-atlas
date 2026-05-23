import { useState } from "react";
import useAtlas from "../hooks/useAtlas";
import TermPanel from "./TermPanel";

export default function Atlas() {
  const { clusters, terms, loading } = useAtlas();
  const [selected, setSelected] = useState(null);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-[#a8978a] font-light tracking-widest text-sm uppercase">
        Loading the territory…
      </div>
    );

  const selectedTerm = terms.find((t) => t.id === selected);

  function getTermsForCluster(clusterId) {
    return terms.filter((t) => t.clusterId === clusterId);
  }

  function isRelated(termId) {
    if (!selectedTerm) return false;
    return selectedTerm.related?.includes(termId);
  }

  function getTermClass(termId) {
    if (!selected) return "default";
    if (termId === selected) return "active";
    if (isRelated(termId)) return "related";
    return "dimmed";
  }

  const termClass = {
    default:
      "bg-[#f0ebe3] border border-[#e2d8cc] text-[#6b5b4e] hover:border-[#c8b89a] hover:text-[#2a2018] hover:bg-[#f8f3ec]",
    active: "bg-[#a87c28] border border-[#a87c28] text-white font-semibold",
    related: "bg-[#f5edda] border border-[#c49a40] text-[#a87c28]",
    dimmed: "bg-[#f0ebe3] border border-[#e2d8cc] text-[#6b5b4e] opacity-30",
  };

  return (
    <div className="max-w-[1400px] mx-auto px-7 pt-12 pb-36">
      {/* Header */}
      <header className="mb-12 pb-9 border-b border-[#e2d8cc]">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#a87c28] mb-5">
          A Personal AdTech Atlas
        </p>
        <h1 className="font-serif font-light text-[clamp(36px,5.5vw,64px)] tracking-tight leading-none text-[#2a2018] mb-5">
          The map of{" "}
          <em className="italic font-normal text-[#a87c28]">the territory</em>
        </h1>
        <p className="text-base text-[#6b5b4e] max-w-lg leading-relaxed">
          Every concept that matters in programmatic, organized by how they
          connect. Tap any term to see what it means and what else it connects
          to.
        </p>
        <div className="mt-6 flex gap-6 flex-wrap text-xs text-[#a8978a]">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a87c28] inline-block"></span>
            Selected term
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#a87c28] inline-block"></span>
            Related terms
          </span>
          <span className="text-[#a87c28] font-semibold">
            {clusters.length}
          </span>{" "}
          clusters
          <span className="text-[#a87c28] font-semibold">
            {terms.length}
          </span>{" "}
          terms
        </div>
      </header>

      {/* Grid */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}
      >
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-white border border-[#e2d8cc] rounded-lg p-7 relative shadow-sm"
          >
            <div className="absolute top-[-1px] left-5 w-10 h-[2.5px] bg-[#c49a40] rounded"></div>
            <p className="font-serif italic text-xs text-[#c49a40] mb-1 tracking-wide">
              {cluster.num} —
            </p>
            <h2 className="font-serif font-normal text-[22px] text-[#2a2018] mb-2 leading-tight">
              {cluster.title}
            </h2>
            <p className="text-[13px] text-[#a8978a] mb-5 leading-snug">
              {cluster.desc}
            </p>
            <div className="flex flex-wrap gap-2">
              {getTermsForCluster(cluster.id).map((term) => (
                <button
                  key={term.id}
                  onClick={() =>
                    setSelected(selected === term.id ? null : term.id)
                  }
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 cursor-pointer ${termClass[getTermClass(term.id)]}`}
                >
                  {term.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Panel */}
      <TermPanel
        term={selectedTerm}
        allTerms={terms}
        onSelect={setSelected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
