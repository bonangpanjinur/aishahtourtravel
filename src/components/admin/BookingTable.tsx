import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingDetailPanel from "./BookingDetailPanel";

interface Booking {
  id: string;
  booking_code: string;
  total_price: number;
  status: string;
  created_at: string;
  package_id: string | null;
  pic_type: string | null;
  pic_id: string | null;
  package: { title: string } | null;
  departure: { departure_date: string } | null;
  profile: { name: string; email: string } | null;
}

interface BookingTableProps {
  bookings: Booking[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onVerifyPayment: (id: string) => void;
}

const BookingMobileCard = ({ b, expandedId, onToggleExpand, onVerifyPayment }: { b: Booking } & Omit<BookingTableProps, 'bookings'>) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="font-mono text-sm text-muted-foreground">{b.booking_code}</span>
      <BookingStatusBadge status={b.status} />
    </div>
    <div>
      <p className="font-semibold">{b.profile?.name || "-"}</p>
      <p className="text-xs text-muted-foreground">{b.profile?.email}</p>
    </div>
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{b.package?.title || "-"}</span>
      <span className="font-semibold">Rp {b.total_price.toLocaleString("id-ID")}</span>
    </div>
    {b.departure?.departure_date && (
      <p className="text-xs text-muted-foreground">
        Keberangkatan: {format(new Date(b.departure.departure_date), "d MMM yyyy", { locale: localeId })}
      </p>
    )}
    <div className="flex gap-2 pt-2 border-t border-border">
      <Button variant="ghost" size="sm" onClick={() => onToggleExpand(b.id)} className="flex-1">
        {expandedId === b.id ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
        Detail
      </Button>
      {b.status === "waiting_payment" && (
        <Button variant="ghost" size="sm" onClick={() => onVerifyPayment(b.id)} className="flex-1 text-success hover:text-success/80">
          <CheckCircle className="w-4 h-4 mr-1" /> Verifikasi
        </Button>
      )}
    </div>
    {expandedId === b.id && (
      <div className="bg-muted/30 rounded-lg -mx-4 -mb-4 mt-2">
        <BookingDetailPanel
          bookingId={b.id}
          packageId={b.package_id}
          picType={b.pic_type}
          picId={b.pic_id}
          packageTitle={b.package?.title || "-"}
        />
      </div>
    )}
  </div>
);

const BookingTable = ({ bookings, expandedId, onToggleExpand, onVerifyPayment }: BookingTableProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4">
            <BookingMobileCard b={b} expandedId={expandedId} onToggleExpand={onToggleExpand} onVerifyPayment={onVerifyPayment} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Paket</TableHead>
            <TableHead>Keberangkatan</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <>
              <TableRow key={b.id} className={expandedId === b.id ? "border-b-0" : ""}>
                <TableCell className="font-mono text-sm">{b.booking_code}</TableCell>
                <TableCell>
                  <div className="font-semibold">{b.profile?.name || "-"}</div>
                  <div className="text-xs text-muted-foreground">{b.profile?.email}</div>
                </TableCell>
                <TableCell>{b.package?.title || "-"}</TableCell>
                <TableCell>
                  {b.departure?.departure_date
                    ? format(new Date(b.departure.departure_date), "d MMM yyyy", { locale: localeId })
                    : "-"}
                </TableCell>
                <TableCell className="font-semibold">
                  Rp {b.total_price.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onToggleExpand(b.id)}>
                      {expandedId === b.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="ml-1">Detail</span>
                    </Button>
                    {b.status === "waiting_payment" && (
                      <Button variant="ghost" size="sm" onClick={() => onVerifyPayment(b.id)} className="text-success hover:text-success/80">
                        <CheckCircle className="w-4 h-4 mr-1" /> Verifikasi
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedId === b.id && (
                <TableRow key={`${b.id}-detail`}>
                  <TableCell colSpan={7} className="bg-muted/30 p-0">
                    <BookingDetailPanel
                      bookingId={b.id}
                      packageId={b.package_id}
                      picType={b.pic_type}
                      picId={b.pic_id}
                      packageTitle={b.package?.title || "-"}
                    />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;
export type { Booking };
