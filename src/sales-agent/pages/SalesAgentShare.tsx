

import { Navigate, useNavigate } from "react-router-dom";
import { AgentHeader } from "../components/AgentHeader";
import { AgentSidebar } from "../components/AgentSidebar";
import { ShareStoreButton } from "../components/ShareStoreButton";
import { useSalesAgent } from "../hooks/useSalesAgent";
import { AgentPanelLayout } from "../components/AgentPanelLayout";

export default function SalesAgentShare() {
  const { agent, isAuthenticated, loading, logout } = useSalesAgent();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated || !agent) {
    return <Navigate to="/agent-panel/login" replace />;
  }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* <AgentHeader
//         agent={agent}
//         title="Share My Store"
//         onLogout={() => {
//           logout();
//           navigate("/agent-panel/login");
//         }}
//       /> */}
// <AgentPanelLayout
//     agent={agent}
//     title="Share My Store" // or "Products & Prices" / "Share My Store"
//     onLogout={() => {
//       logout();
//       navigate("/agent-panel/login");
//     }}
//   >
//       <div className="mx-auto flex max-w-6xl">
//         {/* <AgentSidebar /> */}

//         <main className="min-w-0 flex-1 p-4 md:p-6">
//           <h2 className="text-lg font-semibold">Share My Store</h2>
//           <p className="mt-1 max-w-xl text-sm text-muted-foreground">
//             Send this public link to customers. They will shop the normal Arrheniux experience with
//             <span className="font-medium"> your agent prices</span>. Payments still go to Arrheniux.
//           </p>

//           <div className="mt-6 max-w-lg rounded-2xl border p-4">
//             <ShareStoreButton shareToken={agent.shareToken} agentName={agent.name} />
//           </div>

//           <div className="mt-6 max-w-lg space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
//             <p className="font-semibold">Keep these separate</p>
//             <ul className="list-disc space-y-1 pl-4">
//               <li>
//                 <span className="font-medium">Agent Code</span> ({agent.code}) — private login only. Never share with customers.
//               </li>
//               <li>
//                 <span className="font-medium">Share Token / Store link</span> — public. Safe to post on WhatsApp, Instagram, etc.
//               </li>
//             </ul>
//           </div>

//           <p className="mt-4 text-xs text-muted-foreground">
//             Note: Opening the link shows the full customer storefront after STEP 9 is completed. Until then, the URL may 404 or show a placeholder.
//           </p>
//         </main>
//       </div>
//       </AgentPanelLayout>
//     </div>
//   );

  return (
    <AgentPanelLayout
      agent={agent}
      title="Share My Store"
      onLogout={() => {
        logout();
        navigate("/agent-panel/login");
      }}
    >
      <div className="min-w-0 w-full max-w-lg space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Share My Store</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Send this public link to customers. They shop the normal Arrheniux
            site with{" "}
            <span className="font-medium">your agent prices</span>. Payments
            still go to Arrheniux.
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <ShareStoreButton
            shareToken={agent.shareToken}
            agentName={agent.name}
          />
        </div>

        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">Keep these separate</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <span className="font-medium">Agent Code</span> ({agent.code}) —
              private login only. Never share with customers.
            </li>
            <li>
              <span className="font-medium">Share Token / Store link</span> —
              public. Safe for WhatsApp, Instagram, etc.
            </li>
          </ul>
        </div>
      </div>
    </AgentPanelLayout>
  );
}