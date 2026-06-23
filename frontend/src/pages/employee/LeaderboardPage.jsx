import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { leaderboardService } from "@/services";
import { Spinner, Alert, Avatar, Badge } from "@/components/ui";
import { formatPercent } from "@/utils/helpers";
import { Trophy, Medal } from "lucide-react";

// 👉 REACT BITS: Add <AnimatedList> staggered entrance for leaderboard rows
// 👉 REACT BITS: Highlight the user's own row with <GlowCard>

const RANK_STYLES = {
  1: { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", icon: "🥇" },
  2: { bg: "bg-slate-50 border-slate-200", text: "text-slate-500", icon: "🥈" },
  3: { bg: "bg-orange-50 border-orange-200", text: "text-orange-600", icon: "🥉" },
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data, loading, error } = useApi(() => leaderboardService.get());
  const leaderboard = data?.leaderboard ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header flex items-center gap-3">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Trophy size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="page-subtitle">Ranked by MCQ test score</p>
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}
      {error && <Alert type="error" message={error} />}

      {/* Top 3 podium */}
      {!loading && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, podiumIdx) => {
            if (!entry) return <div key={podiumIdx} />;
            const heights = ["h-28", "h-36", "h-24"];
            const rank = [2, 1, 3][podiumIdx];
            const style = RANK_STYLES[rank];
            const isMe = entry.userId === user?.id;
            return (
              <div key={entry.userId} className={`card p-4 flex flex-col items-center justify-end border ${style.bg} ${isMe ? "ring-2 ring-brand-400" : ""}`} style={{ minHeight: heights[podiumIdx] }}>
                <span className="text-2xl mb-1">{style.icon}</span>
                <Avatar name={entry.name} size="sm" />
                <p className="text-xs font-semibold text-slate-800 mt-1.5 text-center truncate max-w-full">{entry.name}</p>
                <p className={`text-sm font-bold mt-0.5 ${style.text}`}>{formatPercent(entry.actualScore)}</p>
                {isMe && <Badge variant="primary" className="mt-1 text-[10px]">You</Badge>}
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      {!loading && leaderboard.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Actual Score</th>
                <th>Accuracy Index</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const isMe = entry.userId === user?.id;
                const rankStyle = RANK_STYLES[entry.rank];
                return (
                  <tr key={entry.userId} className={isMe ? "bg-brand-50" : ""}>
                    <td>
                      <div className="flex items-center gap-2">
                        {rankStyle ? (
                          <span className="text-lg">{rankStyle.icon}</span>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500 w-6 text-center">#{entry.rank}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={entry.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{entry.name}</p>
                          {isMe && <span className="text-[10px] text-brand-600 font-semibold">You</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-500 text-xs">{entry.department || "—"}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800">{formatPercent(entry.actualScore)}</span>
                    </td>
                    <td>
                      {entry.cai != null ? (
                        <Badge variant={entry.cai >= 80 ? "success" : entry.cai >= 60 ? "warning" : "danger"}>
                          {formatPercent(entry.cai, 0)}
                        </Badge>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && leaderboard.length === 0 && (
        <div className="card p-12 text-center">
          <Medal size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No results yet. Be the first to complete the test!</p>
        </div>
      )}
    </div>
  );
}
