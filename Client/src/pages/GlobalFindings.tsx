import React, { useRef, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link } from "react-router-dom";
import { ShieldAlert, Search, Filter } from "lucide-react";

export default function GlobalFindings() {
   const [findings, setFindings] = useState<any[]>([]);
   const parentRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const statuses = ["open", "fixed", "accepted", "false_positive"];
      const sevs = ["critical", "high", "medium", "low", "info"];
      const cats = ["owasp", "secret", "iac", "flow", "auth"];

      const data = Array.from({ length: 10 }, (_, i) => ({
         id: `f-${i}`,
         title: `Simulated Vulnerability Finding #${i}`,
         severity: sevs[Math.floor(Math.random() * sevs.length)],
         category: cats[Math.floor(Math.random() * cats.length)],
         status: statuses[Math.floor(Math.random() * statuses.length)],
         agent: "owaspAgent",
         file: "src/mock/file.ts",
      }));

      setFindings(data);
   }, []);

   const rowVirtualizer = useVirtualizer({
      count: findings.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 50,
      overscan: 5,
   });

   return (
      <div className="flex flex-col gap-6 h-full fade-in pb-10">
         <div className="flex justify-between items-end">
            <h2 className="text-3xl font-bold flex items-center">
               <ShieldAlert
                  className="mr-3 text-[var(--accent)]"
                  size={28}
               />
               Global Findings
            </h2>

            <div className="flex gap-4">
               <div className="relative">
                  <Search
                     className="absolute left-3 top-2.5 text-[var(--textMuted)]"
                     size={16}
                  />
                  <input
                     type="text"
                     placeholder="Search findings..."
                     className="bg-[var(--surface)] border border-[var(--border)] rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text)]"
                  />
               </div>

               <button className="bg-[var(--surfaceLight)] border border-[var(--border)] px-4 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-[var(--border)] transition-colors">
                  <Filter size={16} />
                  Filters
               </button>
            </div>
         </div>

         <div className="card flex-1 overflow-hidden flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="flex bg-[var(--surfaceLight)] border-b border-[var(--border)] px-6 py-3 text-xs uppercase font-bold text-[var(--textMuted)] tracking-wider">
               <div className="w-32">Severity</div>
               <div className="flex-1">Vulnerability Title</div>
               <div className="w-32">Category</div>
               <div className="w-32">Status</div>
               <div className="w-24 text-right">Action</div>
            </div>

            {/* Body */}
            <div ref={parentRef} className="flex-1 overflow-auto">
               <div
                  style={{
                     height: `${rowVirtualizer.getTotalSize()}px`,
                     width: "100%",
                     position: "relative",
                  }}
               >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                     const finding = findings[virtualRow.index];

                     return (
                        <div
                           key={virtualRow.index}
                           style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                           }}
                           className={`flex items-center px-6 border-b border-[var(--border)] hover:bg-[var(--surfaceLight)] transition-colors ${virtualRow.index % 2 !== 0 ? "bg-black/20" : ""
                              }`}
                        >
                           <div className="w-32">
                              <span className={`badge badge-${finding.severity}`}>
                                 {finding.severity}
                              </span>
                           </div>

                           <div className="flex-1 font-medium truncate pr-4 text-sm">
                              {finding.title}
                           </div>

                           <div className="w-32 text-[var(--textMuted)] text-sm">
                              {finding.category}
                           </div>

                           <div className="w-32 text-sm">
                              <span
                                 className={`px-2 py-1 rounded text-xs border border-[var(--border)] ${finding.status === "open"
                                    ? "text-white"
                                    : "text-[var(--textMuted)]"
                                    }`}
                              >
                                 {finding.status}
                              </span>
                           </div>

                           <div className="w-24 text-right">
                              <Link
                                 to={`/findings/${finding.id}`}
                                 className="text-[var(--accent)] text-sm hover:underline font-medium"
                              >
                                 Review
                              </Link>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </div>
   );
}