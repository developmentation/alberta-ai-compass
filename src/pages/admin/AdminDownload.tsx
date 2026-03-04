import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Newspaper, FileText, Wrench, ExternalLink, MessageSquare, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CONTENT_TYPES = [
  { key: "tools", label: "Tools", icon: Wrench, table: "tools", description: "All AI tools and software listings" },
  { key: "articles", label: "Articles", icon: FileText, table: "articles", description: "All articles with full JSON content" },
  { key: "modules", label: "Learning Modules", icon: GraduationCap, table: "modules", description: "All interactive learning modules" },
  { key: "news", label: "News", icon: Newspaper, table: "news", description: "All news items and updates" },
  { key: "resources", label: "Resources", icon: ExternalLink, table: "resources", description: "All external resources and links" },
  { key: "prompts", label: "Prompts", icon: MessageSquare, table: "prompt_library", description: "All prompt library entries" },
] as const;

type ContentKey = typeof CONTENT_TYPES[number]["key"];

export default function AdminDownload() {
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleDownload = async (key: ContentKey, table: string, label: string) => {
    setDownloading(prev => ({ ...prev, [key]: true }));
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .is("deleted_at", null);

      if (error) throw error;

      const exportPayload = {
        _export_metadata: {
          export_type: key,
          exported_at: new Date().toISOString(),
          total_items: (data || []).length,
        },
        data: data || [],
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Download complete", description: `${label}: ${(data || []).length} items exported.` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(prev => ({ ...prev, all: true }));
    try {
      const results = await Promise.all(
        CONTENT_TYPES.map(async ({ key, table }) => {
          const { data, error } = await supabase
            .from(table as any)
            .select("*")
            .is("deleted_at", null);
          if (error) throw error;
          return [key, data || []] as const;
        })
      );

      const exportPayload = {
        _export_metadata: {
          export_type: "full_library",
          exported_at: new Date().toISOString(),
          content_types: CONTENT_TYPES.map(c => c.key),
        },
        ...Object.fromEntries(results),
        stats: Object.fromEntries(results.map(([k, d]) => [`total_${k}`, d.length])),
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `full-library-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Full library exported", description: `All content types downloaded.` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(prev => ({ ...prev, all: false }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Download Content</h1>
            <p className="text-muted-foreground">Export content by type as JSON files for archival or offline use.</p>
          </div>
          <Button onClick={handleDownloadAll} disabled={downloading.all} variant="outline">
            {downloading.all ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export All Content
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map(({ key, label, icon: Icon, table, description }) => (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="w-5 h-5 text-primary" />
                  {label}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleDownload(key, table, label)}
                  disabled={!!downloading[key]}
                  className="w-full"
                  variant="secondary"
                >
                  {downloading[key] ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download {label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
