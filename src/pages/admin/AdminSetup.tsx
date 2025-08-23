import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Key, Settings, Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ApiKey {
  id: string;
  provider: "gemini" | "azure_openai" | "grok" | "anthropic";
  api_key: string;
  is_active: boolean;
  created_at: string;
  added_by: string;
}

interface SystemConfig {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_by: string;
}

export function AdminSetup() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [systemConfigs, setSystemConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  const [apiKeyFormData, setApiKeyFormData] = useState({
    provider: "gemini" as "gemini" | "azure_openai" | "grok" | "anthropic",
    api_key: "",
    is_active: true,
  });

  const [configFormData, setConfigFormData] = useState({
    key: "",
    value: "",
  });

  useEffect(() => {
    if (isAdmin) {
      fetchApiKeys();
      fetchSystemConfigs();
    }
  }, [isAdmin]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data?.map(key => ({
        ...key,
        provider: key.provider as "gemini" | "azure_openai" | "grok" | "anthropic"
      })) || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("system_configs")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSystemConfigs(data || []);
    } catch (error) {
      console.error("Error fetching system configs:", error);
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const apiKeyData = {
        ...apiKeyFormData,
        added_by: user?.id,
        updated_by: user?.id,
      };

      let result;
      if (editingApiKey) {
        result = await supabase
          .from("api_keys")
          .update(apiKeyData)
          .eq("id", editingApiKey.id);
      } else {
        result = await supabase
          .from("api_keys")
          .insert(apiKeyData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `API key ${editingApiKey ? "updated" : "added"} successfully`,
      });

      setIsApiKeyDialogOpen(false);
      setEditingApiKey(null);
      resetApiKeyForm();
      fetchApiKeys();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let configValue;
      try {
        configValue = JSON.parse(configFormData.value);
      } catch {
        configValue = configFormData.value;
      }

      const configData = {
        key: configFormData.key,
        value: configValue,
        updated_by: user?.id,
      };

      let result;
      if (editingConfig) {
        result = await supabase
          .from("system_configs")
          .update(configData)
          .eq("id", editingConfig.id);
      } else {
        result = await supabase
          .from("system_configs")
          .insert(configData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Configuration ${editingConfig ? "updated" : "created"} successfully`,
      });

      setIsConfigDialogOpen(false);
      setEditingConfig(null);
      resetConfigForm();
      fetchSystemConfigs();
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      const { error } = await supabase
        .from("system_configs")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration deleted successfully",
      });

      fetchSystemConfigs();
    } catch (error) {
      console.error("Error deleting config:", error);
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      });
    }
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetApiKeyForm = () => {
    setApiKeyFormData({
      provider: "gemini",
      api_key: "",
      is_active: true,
    });
  };

  const resetConfigForm = () => {
    setConfigFormData({
      key: "",
      value: "",
    });
  };

  const getProviderBadge = (provider: string) => {
    const colors = {
      gemini: "bg-blue-500",
      azure_openai: "bg-green-500",
      grok: "bg-purple-500",
      anthropic: "bg-orange-500",
    };
    const labels = {
      gemini: "Gemini",
      azure_openai: "Azure OpenAI",
      grok: "Grok",
      anthropic: "Anthropic",
    };
    return { 
      color: colors[provider as keyof typeof colors], 
      label: labels[provider as keyof typeof labels] 
    };
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only administrators can access system setup.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">System Setup</h1>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Setup</h1>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="system-config">System Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">LLM API Keys</h2>
              <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetApiKeyForm(); setEditingApiKey(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingApiKey ? "Edit API Key" : "Add API Key"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure LLM provider API keys for system functionality
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleApiKeySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Provider</label>
                      <Select
                        value={apiKeyFormData.provider}
                        onValueChange={(value) => setApiKeyFormData({ ...apiKeyFormData, provider: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini">Gemini</SelectItem>
                          <SelectItem value="azure_openai">Azure OpenAI</SelectItem>
                          <SelectItem value="grok">Grok</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Key</label>
                      <Input
                        type="password"
                        value={apiKeyFormData.api_key}
                        onChange={(e) => setApiKeyFormData({ ...apiKeyFormData, api_key: e.target.value })}
                        placeholder="Enter API key..."
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={apiKeyFormData.is_active}
                        onChange={(e) => setApiKeyFormData({ ...apiKeyFormData, is_active: e.target.checked })}
                      />
                      <label htmlFor="is_active" className="text-sm font-medium">
                        Active
                      </label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingApiKey ? "Update" : "Add"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {apiKeys.map((apiKey) => {
                const providerBadge = getProviderBadge(apiKey.provider);
                return (
                  <Card key={apiKey.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-white ${providerBadge.color}`}>
                              {providerBadge.label}
                            </Badge>
                            <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                              {apiKey.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {showApiKey[apiKey.id] 
                                ? apiKey.api_key 
                                : `${"*".repeat(Math.min(apiKey.api_key.length, 20))}...`
                              }
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(apiKey.id)}
                            >
                              {showApiKey[apiKey.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingApiKey(apiKey);
                              setApiKeyFormData({
                                provider: apiKey.provider,
                                api_key: apiKey.api_key,
                                is_active: apiKey.is_active,
                              });
                              setIsApiKeyDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground">
                        Added: {new Date(apiKey.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {apiKeys.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Key className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No API keys configured. Add your first LLM API key to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="system-config" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">System Configuration</h2>
              <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetConfigForm(); setEditingConfig(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Configuration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingConfig ? "Edit Configuration" : "Add Configuration"}
                    </DialogTitle>
                    <DialogDescription>
                      Configure system settings and parameters
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleConfigSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Key</label>
                      <Input
                        value={configFormData.key}
                        onChange={(e) => setConfigFormData({ ...configFormData, key: e.target.value })}
                        placeholder="e.g., ai_mentor_prompt"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Value (JSON or string)</label>
                      <textarea
                        className="w-full min-h-[100px] p-3 border rounded-md"
                        value={configFormData.value}
                        onChange={(e) => setConfigFormData({ ...configFormData, value: e.target.value })}
                        placeholder='{"setting": "value"} or simple string'
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingConfig ? "Update" : "Add"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {systemConfigs.map((config) => (
                <Card key={config.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{config.key}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConfig(config);
                            setConfigFormData({
                              key: config.key,
                              value: typeof config.value === "object" 
                                ? JSON.stringify(config.value, null, 2)
                                : String(config.value),
                            });
                            setIsConfigDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteConfig(config.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted/50 p-3 rounded-md overflow-x-auto">
                      {typeof config.value === "object" 
                        ? JSON.stringify(config.value, null, 2)
                        : String(config.value)
                      }
                    </pre>
                    <div className="text-xs text-muted-foreground mt-2">
                      Updated: {new Date(config.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {systemConfigs.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No system configurations found. Add your first configuration to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}