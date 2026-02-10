import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import PackageCommissions from "@/components/admin/PackageCommissions";

interface Category {
  id: string;
  name: string;
}

interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;
  package_type: string;
  duration_days: number;
  minimum_dp: number;
  dp_deadline_days: number;
  full_deadline_days: number;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
}

const PACKAGE_TYPES = ["VIP", "Reguler", "Hemat", "Promo"];

const AdminPackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [expandedCommission, setExpandedCommission] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    package_type: "",
    duration_days: 9,
    minimum_dp: 0,
    dp_deadline_days: 30,
    full_deadline_days: 7,
    image_url: "",
    category_id: "",
  });

  useEffect(() => {
    fetchPackages();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("package_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order");
    setCategories(data || []);
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: false });
    setPackages(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Only send fields that exist in the table
    const payload = {
      title: form.title,
      slug,
      description: form.description || null,
      package_type: form.package_type || null,
      duration_days: form.duration_days,
      minimum_dp: form.minimum_dp,
      dp_deadline_days: form.dp_deadline_days,
      full_deadline_days: form.full_deadline_days,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from("packages")
          .update(payload)
          .eq("id", editing.id);

        if (error) throw error;
        toast({ title: "Paket diupdate!" });
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
        toast({ title: "Paket ditambahkan!" });
      }
      fetchPackages();
      setIsOpen(false);
      resetForm();
    } catch (error: any) {
      // If schema cache error, retry without deadline fields
      if (error?.message?.includes("schema cache")) {
        const { dp_deadline_days, full_deadline_days, ...retryPayload } = payload;
        try {
          if (editing) {
            const { error: retryErr } = await supabase.from("packages").update(retryPayload).eq("id", editing.id);
            if (retryErr) throw retryErr;
          } else {
            const { error: retryErr } = await supabase.from("packages").insert(retryPayload);
            if (retryErr) throw retryErr;
          }
          toast({ title: editing ? "Paket diupdate!" : "Paket ditambahkan!", description: "Beberapa field deadline dilewati karena cache." });
          fetchPackages();
          setIsOpen(false);
          resetForm();
        } catch (retryErr: any) {
          toast({ title: "Gagal menyimpan", description: retryErr.message, variant: "destructive" });
        }
      } else {
        toast({ title: editing ? "Gagal mengupdate" : "Gagal membuat paket", description: error.message, variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditing(pkg);
    setForm({
      title: pkg.title,
      slug: pkg.slug,
      description: pkg.description || "",
      package_type: pkg.package_type || "",
      duration_days: pkg.duration_days,
      minimum_dp: pkg.minimum_dp || 0,
      dp_deadline_days: pkg.dp_deadline_days || 30,
      full_deadline_days: pkg.full_deadline_days || 7,
      image_url: pkg.image_url || "",
      category_id: pkg.category_id || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus paket ini?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Paket dihapus" });
      fetchPackages();
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ title: "", slug: "", description: "", package_type: "", duration_days: 9, minimum_dp: 0, dp_deadline_days: 30, full_deadline_days: 7, image_url: "", category_id: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Paket</h1>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-gold text-primary">
              <Plus className="w-4 h-4 mr-2" /> Tambah Paket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{editing ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* Row 1: Nama & Tipe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nama Paket <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Contoh: Umroh VIP 9 Hari"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Tipe Paket</Label>
                  <Select value={form.package_type} onValueChange={(val) => setForm({ ...form, package_type: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe paket" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Slug & Durasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Slug (URL)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated jika kosong"
                  />
                  <p className="text-xs text-muted-foreground">Otomatis dari nama jika dikosongkan</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Durasi (hari)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) || 9 })}
                  />
                </div>
              </div>

              {/* Row 3: DP & Deadlines */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Pengaturan Pembayaran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Minimal DP (Rp)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.minimum_dp}
                      onChange={(e) => setForm({ ...form, minimum_dp: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Deadline DP (hari)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.dp_deadline_days}
                      onChange={(e) => setForm({ ...form, dp_deadline_days: parseInt(e.target.value) || 30 })}
                    />
                    <p className="text-xs text-muted-foreground">Sebelum berangkat</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Deadline Pelunasan (hari)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.full_deadline_days}
                      onChange={(e) => setForm({ ...form, full_deadline_days: parseInt(e.target.value) || 7 })}
                    />
                    <p className="text-xs text-muted-foreground">Sebelum berangkat</p>
                  </div>
                </div>
              </div>

              {/* Kategori & Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Kategori</Label>
                  <Select value={form.category_id} onValueChange={(val) => setForm({ ...form, category_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categories.length === 0 && (
                    <p className="text-xs text-muted-foreground">Belum ada kategori. Tambah di menu Kategori.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">URL Gambar</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.image_url && (
                    <div className="mt-2 rounded-lg border border-border overflow-hidden w-20 h-20">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Deskripsi</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi singkat paket umroh..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" className="gradient-gold text-primary min-w-[120px]" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">Belum ada paket</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Paket</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <React.Fragment key={pkg.id}>
                  <TableRow>
                    <TableCell className="font-semibold">{pkg.title}</TableCell>
                    <TableCell>{pkg.package_type || "-"}</TableCell>
                    <TableCell>{pkg.duration_days} hari</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {pkg.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setExpandedCommission(expandedCommission === pkg.id ? null : pkg.id)} title="Komisi">
                          {expandedCommission === pkg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <Link to={`/paket/${pkg.slug}`} target="_blank">
                          <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedCommission === pkg.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/50 p-4">
                        <PackageCommissions packageId={pkg.id} packageTitle={pkg.title} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
