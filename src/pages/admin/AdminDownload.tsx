import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Download, Loader2, Newspaper, FileText, Wrench, ExternalLink,
  MessageSquare, GraduationCap, ChevronDown, ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CONTENT_TYPES = [
  { key: "tools", label: "Tools", icon: Wrench, table: "tools", nameField: "name", description: "All AI tools and software listings" },
  { key: "articles", label: "Articles", icon: FileText, table: "articles", nameField: "title", description: "All articles with full JSON content" },
  { key: "modules", label: "Learning Modules", icon: GraduationCap, table: "modules", nameField: "name", description: "All interactive learning modules" },
  { key: "news", label: "News", icon: Newspaper, table: "news", nameField: "title", description: "All news items and updates" },
  { key: "resources", label: "Resources", icon: ExternalLink, table: "resources", nameField: "title", description: "All external resources and links" },
  { key: "prompts", label: "Prompts", icon: MessageSquare, table: "prompt_library", nameField: "name", description: "All prompt library entries" },
] as const;

type ContentKey = typeof CONTENT_TYPES[number]["key"];

interface ContentItem {
  id: string;
  name?: string;
  title?: string;
  status?: string;
  level?: string;
  description?: string;
  created_at?: string;
  [key: string]: any;
}

function getDisplayName(item: ContentItem, nameField: string): string {
  return (item as any)[nameField] || item.name || item.title || "Untitled";
}

function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ContentTypeSection({
  config,
  onExportSelected,
}: {
  config: typeof CONTENT_TYPES[number];
  onExportSelected: (key: string, items: ContentItem[]) => void;
}) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const { key, label, icon: Icon, table, nameField, description } = config;

  const loadData = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(table as any)
        .select("*")
        .is("deleted_at", null);
      if (error) throw error;
      const sorted = ((data as any[]) || []).sort((a: any, b: any) => {
        const nameA = getDisplayName(a, nameField).toLowerCase();
        const nameB = getDisplayName(b, nameField).toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" });
      });
      setItems(sorted);
      setLoaded(true);
    } catch (err: any) {
      toast({ title: "Failed to load", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [loaded, table, nameField, toast]);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) loadData();
  };

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    if (!loaded) await loadData();
    const exportPayload = {
      _export_metadata: {
        export_type: key,
        exported_at: new Date().toISOString(),
        total_items: items.length,
      },
      data: items,
    };
    downloadJson(exportPayload, `${key}-export-${new Date().toISOString().slice(0, 10)}.json`);
    toast({ title: "Download complete", description: `${label}: ${items.length} items exported.` });
    setDownloading(false);
  };

  const handleDownloadSelected = () => {
    const selectedItems = items.filter(i => selected.has(i.id));
    if (selectedItems.length === 0) {
      toast({ title: "Nothing selected", description: "Check at least one item to export.", variant: "destructive" });
      return;
    }
    const exportPayload = {
      _export_metadata: {
        export_type: key,
        exported_at: new Date().toISOString(),
        total_items: selectedItems.length,
        selection: "partial",
      },
      data: selectedItems,
    };
    downloadJson(exportPayload, `${key}-selected-${new Date().toISOString().slice(0, 10)}.json`);
    toast({ title: "Download complete", description: `${label}: ${selectedItems.length} selected items exported.` });
  };

  const allChecked = items.length > 0 && selected.size === items.length;
  const someChecked = selected.size > 0 && selected.size < items.length;

  return (
    <Collapsible open={open} onOpenChange={handleOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Icon className="w-5 h-5 text-primary" />
                {label}
                {loaded && (
                  <Badge variant="secondary" className="ml-2 font-normal">{items.length} items</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                {selected.size > 0 && (
                  <Button size="sm" variant="default" onClick={handleDownloadSelected}>
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export {selected.size} Selected
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleDownloadAll} disabled={downloading}>
                  {downloading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
                  Export All
                </Button>
              </div>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No items found.</p>
            ) : (
              <div className="border rounded-md max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allChecked}
                          // @ts-ignore
                          indeterminate={someChecked}
                          onCheckedChange={toggleAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-20">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow
                        key={item.id}
                        className={selected.has(item.id) ? "bg-primary/5" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selected.has(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                            aria-label={`Select ${getDisplayName(item, nameField)}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {getDisplayName(item, nameField)}
                        </TableCell>
                        <TableCell>
                          {item.status && (
                            <Badge variant={item.status === "published" ? "default" : "secondary"} className="text-xs">
                              {item.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.level && (
                            <Badge variant="outline" className="text-xs">{item.level}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function AdminDownload() {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadAll = async () => {
    setDownloading(true);
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

      downloadJson(exportPayload, `full-library-export-${new Date().toISOString().slice(0, 10)}.json`);
      toast({ title: "Full library exported", description: "All content types downloaded." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Download Content</h1>
            <p className="text-muted-foreground">Browse, select, and export content by type as JSON files.</p>
          </div>
          <Button onClick={handleDownloadAll} disabled={downloading} variant="outline">
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export Full Library
          </Button>
        </div>

        <div className="space-y-3">
          {CONTENT_TYPES.map(config => (
            <ContentTypeSection
              key={config.key}
              config={config}
              onExportSelected={() => {}}
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
