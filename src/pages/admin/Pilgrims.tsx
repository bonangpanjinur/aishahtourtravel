import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Users, Calendar, Phone, Mail, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import ErrorAlert from "@/components/ui/error-alert";

interface Pilgrim {
  id: string;
  name: string;
  nik: string | null;
  phone: string | null;
  email: string | null;
  gender: string | null;
  birth_date: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  booking_id: string | null;
  created_at: string;
  booking?: {
    id: string;
    booking_code: string;
    status: string;
    total_price: number;
    package?: { title: string } | null;
    departure?: { departure_date: string } | null;
  } | null;
}

const getStatusBadge = (status: string | undefined) => {
  switch (status) {
    case "paid": return <Badge className="bg-success/10 text-success border-success/20">Lunas</Badge>;
    case "waiting_payment": return <Badge className="bg-warning/10 text-warning border-warning/20">Menunggu</Badge>;
    case "cancelled": return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Batal</Badge>;
    default: return <Badge variant="outline">{status || "draft"}</Badge>;
  }
};

const AdminPilgrims = () => {
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPilgrim, setSelectedPilgrim] = useState<Pilgrim | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const isMobile = useIsMobile();

  const fetchPilgrims = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("booking_pilgrims")
        .select(`
          *,
          booking:bookings(
            id, booking_code, status, total_price,
            package:packages(title),
            departure:package_departures(departure_date)
          )
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setPilgrims((data as unknown as Pilgrim[]) || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data jemaah");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPilgrims();
  }, [fetchPilgrims]);

  const filteredPilgrims = pilgrims.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.nik?.toLowerCase().includes(searchLower) ||
      p.passport_number?.toLowerCase().includes(searchLower) ||
      p.phone?.toLowerCase().includes(searchLower) ||
      p.email?.toLowerCase().includes(searchLower) ||
      p.booking?.booking_code?.toLowerCase().includes(searchLower)
    );
  });

  const showDetail = (pilgrim: Pilgrim) => {
    setSelectedPilgrim(pilgrim);
    setDetailOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Daftar Jemaah</h1>
          <p className="text-muted-foreground">Total {pilgrims.length} jemaah terdaftar</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari nama, NIK, paspor, booking..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchPilgrims} />
      ) : filteredPilgrims.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "Tidak Ditemukan" : "Belum Ada Jemaah"}
          description={search ? "Tidak ada jemaah yang cocok dengan pencarian" : "Data jemaah akan muncul di sini"}
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {filteredPilgrims.map((pilgrim) => (
            <div key={pilgrim.id} className="bg-card border border-border rounded-xl p-4 space-y-3" onClick={() => showDetail(pilgrim)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{pilgrim.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pilgrim.gender === "male" ? "Laki-laki" : pilgrim.gender === "female" ? "Perempuan" : "-"}
                  </p>
                </div>
                {getStatusBadge(pilgrim.booking?.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">NIK:</span> {pilgrim.nik || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Paspor:</span> {pilgrim.passport_number || "-"}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline" className="font-mono text-xs">{pilgrim.booking?.booking_code || "-"}</Badge>
                <span className="text-muted-foreground">{pilgrim.booking?.package?.title || "-"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Jemaah</TableHead>
                  <TableHead>NIK / Paspor</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Kode Booking</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPilgrims.map((pilgrim) => (
                  <TableRow key={pilgrim.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{pilgrim.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pilgrim.gender === "male" ? "Laki-laki" : pilgrim.gender === "female" ? "Perempuan" : "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>NIK: {pilgrim.nik || "-"}</p>
                        <p>Paspor: {pilgrim.passport_number || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{pilgrim.phone || "-"}</p>
                        <p className="text-muted-foreground">{pilgrim.email || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{pilgrim.booking?.booking_code || "-"}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{pilgrim.booking?.package?.title || "-"}</p>
                    </TableCell>
                    <TableCell>{getStatusBadge(pilgrim.booking?.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => showDetail(pilgrim)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Jemaah</DialogTitle>
          </DialogHeader>
          {selectedPilgrim && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">INFORMASI PRIBADI</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{selectedPilgrim.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPilgrim.gender === "male" ? "Laki-laki" : selectedPilgrim.gender === "female" ? "Perempuan" : "Tidak disebutkan"}
                      </p>
                    </div>
                  </div>
                  {selectedPilgrim.birth_date && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <p>{format(new Date(selectedPilgrim.birth_date), "dd MMMM yyyy", { locale: idLocale })}</p>
                    </div>
                  )}
                  {selectedPilgrim.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <p>{selectedPilgrim.phone}</p>
                    </div>
                  )}
                  {selectedPilgrim.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <p>{selectedPilgrim.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">DOKUMEN</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">NIK</p>
                      <p className="font-mono">{selectedPilgrim.nik || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">No. Paspor</p>
                      <p className="font-mono">{selectedPilgrim.passport_number || "-"}</p>
                    </div>
                  </div>
                  {selectedPilgrim.passport_expiry && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Masa Berlaku Paspor</p>
                        <p>{format(new Date(selectedPilgrim.passport_expiry), "dd MMMM yyyy", { locale: idLocale })}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedPilgrim.booking && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3">INFORMASI BOOKING</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kode Booking</span>
                      <span className="font-mono font-semibold">{selectedPilgrim.booking.booking_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paket</span>
                      <span>{selectedPilgrim.booking.package?.title || "-"}</span>
                    </div>
                    {selectedPilgrim.booking.departure?.departure_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Keberangkatan</span>
                        <span>{format(new Date(selectedPilgrim.booking.departure.departure_date), "dd MMM yyyy", { locale: idLocale })}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(selectedPilgrim.booking.status)}
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border mt-2">
                      <span className="text-muted-foreground">Total Harga</span>
                      <span className="font-semibold">
                        Rp {selectedPilgrim.booking.total_price?.toLocaleString("id-ID") || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPilgrims;
