import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Eye, CheckCircle, XCircle, Image, DollarSign } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  proof_url: string | null;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  booking: {
    id: string;
    booking_code: string;
    status: string;
    total_price: number;
    user_id: string;
  } | null;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select(`
        *,
        booking:bookings(id, booking_code, status, total_price, user_id)
      `)
      .order("created_at", { ascending: false });

    setPayments((data as unknown as Payment[]) || []);
    setLoading(false);
  };

  const handleVerify = async (payment: Payment, approve: boolean) => {
    if (!confirm(approve ? "Setujui pembayaran ini?" : "Tolak pembayaran ini?")) return;

    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: approve ? "paid" : "failed",
        verified_at: new Date().toISOString(),
        paid_at: approve ? new Date().toISOString() : null,
      })
      .eq("id", payment.id);

    if (paymentError) {
      toast({ title: "Gagal", description: paymentError.message, variant: "destructive" });
      return;
    }

    // Update booking status
    if (payment.booking) {
      await supabase
        .from("bookings")
        .update({ status: approve ? "paid" : "cancelled" })
        .eq("id", payment.booking.id);
    }

    toast({ title: approve ? "Pembayaran disetujui!" : "Pembayaran ditolak" });
    fetchPayments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Menunggu</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terverifikasi</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Verifikasi Pembayaran</h1>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran - {selectedPayment?.booking?.booking_code}</DialogTitle>
          </DialogHeader>
          {selectedPayment?.proof_url && (
            <div className="space-y-4">
              <img
                src={selectedPayment.proof_url}
                alt="Bukti pembayaran"
                className="w-full rounded-lg"
              />
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Total Pembayaran</div>
                  <div className="text-xl font-bold text-gold">
                    Rp {selectedPayment.amount.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleVerify(selectedPayment, false);
                      setImageOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Tolak
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleVerify(selectedPayment, true);
                      setImageOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Setujui
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Belum ada pembayaran</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Booking</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Bukti</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono font-semibold">
                    {payment.booking?.booking_code || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      Rp {payment.amount.toLocaleString("id-ID")}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{payment.payment_method || "-"}</TableCell>
                  <TableCell>
                    {payment.proof_url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setImageOpen(true);
                        }}
                      >
                        <Image className="w-4 h-4 mr-1" /> Lihat
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Tidak ada</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(payment.created_at), "d MMM yyyy HH:mm", { locale: localeId })}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status || "pending")}</TableCell>
                  <TableCell className="text-right">
                    {payment.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleVerify(payment, false)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleVerify(payment, true)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
