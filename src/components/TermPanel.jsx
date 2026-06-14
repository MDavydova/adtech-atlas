import { useState } from 'react'

export default function TermPanel({ term, allTerms, onSelect, onClose }) {
  const [deepDiveOpen, setDeepDiveOpen] = useState(false)

  if (!term) return null

  const relatedTerms = (term.related || [])
    .map(id => allTerms.find(t => t.id === id))
    .filter(Boolean)

  const a = term.article

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[700px] bg-white border border-[#c8b89a] rounded-xl shadow-2xl z-50 overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-start gap-4 px-7 pt-6 pb-4 border-b border-[#e2d8cc]">
        <h3 className="font-serif font-normal text-[22px] text-[#a87c28] leading-tight">{term.name}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 border border-[#e2d8cc] rounded-md text-[#a8978a] hover:text-[#2a2018] hover:border-[#c8b89a] transition-all text-base flex-shrink-0 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto max-h-[65vh] px-7 py-5 space-y-5">

        {/* Short definition */}
        <p className="text-[15px] text-[#6b5b4e] leading-relaxed">{term.def}</p>

        {/* Article sections */}
        {a && (
          <div className="space-y-4 border-t border-[#e2d8cc] pt-4">
            {a.summary && (
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#a87c28] mb-1">The full picture</p>
                <p className="text-[14px] text-[#6b5b4e] leading-relaxed">{a.summary}</p>
              </div>
            )}
            {a.howItWorks && (
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#a87c28] mb-1">How it works</p>
                <p className="text-[14px] text-[#6b5b4e] leading-relaxed">{a.howItWorks}</p>
              </div>
            )}
            {a.whyItMatters && (
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#a87c28] mb-1">Why it matters</p>
                <p className="text-[14px] text-[#6b5b4e] leading-relaxed">{a.whyItMatters}</p>
              </div>
            )}
            {a.example && (
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#a87c28] mb-1">Example</p>
                <p className="text-[14px] text-[#6b5b4e] leading-relaxed">{a.example}</p>
              </div>
            )}
            {a.watchOutFor && (
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-[#a87c28] mb-1">Watch out for</p>
                <p className="text-[14px] text-[#6b5b4e] leading-relaxed">{a.watchOutFor}</p>
              </div>
            )}

            {/* Deep Dive — collapsible */}
            {a.deepDive && (
              <div className="border-t border-[#e2d8cc] pt-4">
                <button
                  onClick={() => setDeepDiveOpen(!deepDiveOpen)}
                  className="flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[#a87c28] hover:text-[#c49a40] transition-colors"
                >
                  <span>{deepDiveOpen ? '↓' : '→'}</span>
                  <span>Deep dive</span>
                </button>
                {deepDiveOpen && (
                  <div className="mt-3 space-y-3">
                    {a.deepDive.map((section, i) => (
                      <div key={i}>
                        {section.heading && (
                          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#c49a40] mb-1">{section.heading}</p>
                        )}
                        <p className="text-[14px] text-[#6b5b4e] leading-relaxed">{section.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Related terms */}
        {relatedTerms.length > 0 && (
          <div className="border-t border-[#e2d8cc] pt-4 text-[13px] text-[#a8978a]">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#a87c28] mr-2">connects to</span>
            {relatedTerms.map((t, i) => (
              <span key={t.id}>
                <span
                  onClick={() => onSelect(t.id)}
                  className="cursor-pointer border-b border-[#c8b89a] text-[#6b5b4e] hover:text-[#a87c28] transition-colors"
                >
                  {t.name}
                </span>
                {i < relatedTerms.length - 1 && ' · '}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
