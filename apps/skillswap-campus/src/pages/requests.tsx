import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useListSwapRequests, useUpdateSwapRequestStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getListSwapRequestsQueryKey } from "@workspace/api-client-react";
import { Inbox, Send, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_ICONS = {
  pending: <Clock className="h-3.5 w-3.5" />,
  accepted: <CheckCircle className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

function RequestCard({ request, showActions, onAction, actionLoading }: {
  request: any;
  showActions: boolean;
  onAction: (id: number, status: "accepted" | "rejected") => void;
  actionLoading: number | null;
}) {
  return (
    <Card className="border-card-border hover:border-primary/30 transition-all">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {showActions ? request.sender.avatarInitials : request.receiver.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold">{showActions ? request.sender.name : request.receiver.name}</span>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}`}>
                {STATUS_ICONS[request.status as keyof typeof STATUS_ICONS]}
                {request.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              {showActions ? "wants to swap for:" : "you requested:"}
              <span className="font-medium text-foreground ml-1">{request.skillPost?.title}</span>
            </p>
            {request.message && (
              <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg px-3 py-2 mt-2">
                "{request.message}"
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {showActions ? request.sender.college : request.receiver.college} · {showActions ? request.sender.department : request.receiver.department}
            </p>
          </div>
          {showActions && request.status === "pending" && (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                onClick={() => onAction(request.id, "rejected")}
                disabled={actionLoading === request.id}
              >
                {actionLoading === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onAction(request.id, "accepted")}
                disabled={actionLoading === request.id}
              >
                {actionLoading === request.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Requests() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const updateStatus = useUpdateSwapRequestStatus();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  const { data: received, isLoading: receivedLoading } = useListSwapRequests(
    { direction: "received" },
    { query: { enabled: !!user } }
  );
  const { data: sent, isLoading: sentLoading } = useListSwapRequests(
    { direction: "sent" },
    { query: { enabled: !!user } }
  );

  const handleAction = async (id: number, status: "accepted" | "rejected") => {
    setActionLoading(id);
    try {
      await updateStatus.mutateAsync({ id, data: { status } });
      queryClient.invalidateQueries({ queryKey: getListSwapRequestsQueryKey() });
      toast.success(status === "accepted" ? "Request accepted!" : "Request declined");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) return null;

  const pendingCount = received?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Swap Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing skill exchange requests</p>
        {pendingCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium">
            <Clock className="h-4 w-4" />
            {pendingCount} pending request{pendingCount !== 1 ? "s" : ""} waiting for your response
          </div>
        )}
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList>
          <TabsTrigger value="received" className="gap-2">
            <Inbox className="h-4 w-4" />
            Received
            {received?.length ? <Badge variant="secondary" className="ml-1 text-xs">{received.length}</Badge> : null}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent
            {sent?.length ? <Badge variant="secondary" className="ml-1 text-xs">{sent.length}</Badge> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : !received?.length ? (
            <div className="text-center py-20">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold">No requests received yet</h3>
              <p className="text-muted-foreground text-sm mt-1">When students request to swap with you, they'll appear here</p>
            </div>
          ) : (
            received.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                showActions={true}
                onAction={handleAction}
                actionLoading={actionLoading}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : !sent?.length ? (
            <div className="text-center py-20">
              <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold">No requests sent yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Browse skills and send swap requests to get started</p>
            </div>
          ) : (
            sent.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                showActions={false}
                onAction={handleAction}
                actionLoading={actionLoading}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
