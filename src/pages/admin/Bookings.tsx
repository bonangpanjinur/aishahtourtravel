import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BookingTable, { Booking } from "@/components/admin/BookingTable";
import BookingFilters from "@/components/admin/BookingFilters";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import ErrorAlert from "@/components/ui/error-alert";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      // Get total count first
      let countQuery = supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });
      if (filter !== "all") countQuery = countQuery.eq("status", filter);
      const { count } = await countQuery;
      setTotalCount(count || 0);

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("bookings")
        .select(`
          id, booking_code, total_price, status, created_at, package_id, pic_type, pic_id, user_id,
          package:packages(title),
          departure:package_departures(departure_date)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // Fetch profiles separately to avoid ambiguous relationship error
      const userIds = [...new Set((data || []).map((b: any) => b.user_id).filter(Boolean))];
      let profilesMap: Record<string, { name: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);
        if (profiles) {
          profiles.forEach((p: any) => { profilesMap[p.id] = { name: p.name, email: p.email }; });
        }
      }

      const enriched = (data || []).map((b: any) => ({
        ...b,
        profile: b.user_id ? profilesMap[b.user_id] || null : null,
      }));
      setBookings(enriched as Booking[]);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data booking");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleVerifyPayment = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", bookingId);

      if (error) throw error;

      await supabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("booking_id", bookingId);

      toast({ title: "Pembayaran diverifikasi!" });
      fetchBookings();
    } catch (err: any) {
      toast({ title: "Gagal verifikasi", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Booking</h1>
        <BookingFilters filter={filter} onFilterChange={(f) => { setFilter(f); setPage(0); }} />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum Ada Booking"
          description="Booking dari jemaah akan muncul di sini"
        />
      ) : (
        <>
          <BookingTable
            bookings={bookings}
            expandedId={expandedId}
            onToggleExpand={handleToggleExpand}
            onVerifyPayment={handleVerifyPayment}
          />
          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 px-2">
              <span className="text-sm text-muted-foreground">
                {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} dari {totalCount}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= totalCount} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminBookings;
