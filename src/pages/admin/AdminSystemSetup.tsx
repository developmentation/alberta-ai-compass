import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Key, Globe, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface ApiKey {
  id: string;
  provider: string;
  description?: string;
  model_names: string[];
  is_active: boolean;
  created_at: string;
}

interface AllowedDomain {
  id: string;
  domain: string;
  created_at: string;
}

export default function AdminSystemSetup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [domains, setDomains] = useState<AllowedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  
  // API Key form state
  const [apiKeyForm, setApiKeyForm] = useState({
    id: '',
    provider: '',
    description: '',
    model_names: [] as string[],
    api_key: '',
    is_active: true
  });
  
  // Domain form state
  const [domainForm, setDomainForm] = useState({
    id: '',
    domain: ''
  });
  
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [apiKeysResponse, domainsResponse] = await Promise.all([
        supabase.from('api_keys').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('allowed_domains').select('*').is('deleted_at', null).order('created_at', { ascending: false })
      ]);

      if (apiKeysResponse.error) throw apiKeysResponse.error;
      if (domainsResponse.error) throw domainsResponse.error;

      setApiKeys(apiKeysResponse.data || []);
      setDomains(domainsResponse.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetApiKeyForm = () => {
    setApiKeyForm({
      id: '',
      provider: '',
      description: '',
      model_names: [],
      api_key: '',
      is_active: true
    });
  };

  const resetDomainForm = () => {
    setDomainForm({
      id: '',
      domain: ''
    });
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const baseData = {
        provider: apiKeyForm.provider,
        description: apiKeyForm.description,
        model_names: apiKeyForm.model_names,
        api_key: apiKeyForm.api_key,
        is_active: apiKeyForm.is_active,
        added_by: user?.id || ''
      };
      
      const data = apiKeyForm.id ? { ...baseData, updated_by: user?.id } : baseData;

      if (apiKeyForm.id) {
        const { error } = await supabase
          .from('api_keys')
          .update(data)
          .eq('id', apiKeyForm.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_keys')
          .insert(data);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `API key ${apiKeyForm.id ? 'updated' : 'added'} successfully`,
      });

      resetApiKeyForm();
      setIsApiKeyDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        domain: domainForm.domain,
        ...(domainForm.id ? {} : { added_by: user?.id })
      };

      if (domainForm.id) {
        const { error } = await supabase
          .from('allowed_domains')
          .update(data)
          .eq('id', domainForm.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('allowed_domains')
          .insert(data);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Domain ${domainForm.id ? 'updated' : 'added'} successfully`,
      });

      resetDomainForm();
      setIsDomainDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save domain",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDomain = async (id: string) => {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain",
        variant: "destructive",
      });
    }
  };

  const editApiKey = (apiKey: ApiKey) => {
    setApiKeyForm({
      id: apiKey.id,
      provider: apiKey.provider,
      description: apiKey.description || '',
      model_names: apiKey.model_names || [],
      api_key: '',
      is_active: apiKey.is_active
    });
    setIsApiKeyDialogOpen(true);
  };

  const editDomain = (domain: AllowedDomain) => {
    setDomainForm({
      id: domain.id,
      domain: domain.domain
    });
    setIsDomainDialogOpen(true);
  };

  const addModelName = () => {
    if (newModelName.trim() && !apiKeyForm.model_names.includes(newModelName.trim())) {
      setApiKeyForm({
        ...apiKeyForm,
        model_names: [...apiKeyForm.model_names, newModelName.trim()]
      });
      setNewModelName('');
    }
  };

  const removeModelName = (modelName: string) => {
    setApiKeyForm({
      ...apiKeyForm,
      model_names: apiKeyForm.model_names.filter(name => name !== modelName)
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Setup</h1>
          <p className="text-muted-foreground">Configure API keys and manage allowed domains</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* API Keys Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage API keys for AI services and integrations
                </CardDescription>
              </div>
              <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={resetApiKeyForm}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {apiKeyForm.id ? 'Edit API Key' : 'Add API Key'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleApiKeySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="provider">Provider</Label>
                      <Input
                        id="provider"
                        value={apiKeyForm.provider}
                        onChange={(e) => setApiKeyForm({...apiKeyForm, provider: e.target.value})}
                        placeholder="e.g., OpenAI, Gemini, Anthropic"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={apiKeyForm.description}
                        onChange={(e) => setApiKeyForm({...apiKeyForm, description: e.target.value})}
                        placeholder="Optional description"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={apiKeyForm.api_key}
                        onChange={(e) => setApiKeyForm({...apiKeyForm, api_key: e.target.value})}
                        placeholder={apiKeyForm.id ? "Enter new key to update" : "Enter API key"}
                        required={!apiKeyForm.id}
                      />
                    </div>
                    
                    <div>
                      <Label>Model Names</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={newModelName}
                          onChange={(e) => setNewModelName(e.target.value)}
                          placeholder="Add model name"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addModelName())}
                        />
                        <Button type="button" variant="outline" onClick={addModelName}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {apiKeyForm.model_names.map((model) => (
                          <Badge key={model} variant="secondary" className="flex items-center gap-1">
                            {model}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeModelName(model)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {apiKeyForm.id ? 'Update' : 'Add'} Key
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{apiKey.provider}</div>
                      {apiKey.description && (
                        <div className="text-sm text-muted-foreground">{apiKey.description}</div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.model_names?.map((model) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editApiKey(apiKey)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteApiKey(apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {apiKeys.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No API keys configured yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Allowed Domains Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Allowed Domains
                </CardTitle>
                <CardDescription>
                  Manage domains for government user registration
                </CardDescription>
              </div>
              <Dialog open={isDomainDialogOpen} onOpenChange={setIsDomainDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={resetDomainForm}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Domain
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {domainForm.id ? 'Edit Domain' : 'Add Allowed Domain'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleDomainSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        value={domainForm.domain}
                        onChange={(e) => setDomainForm({...domainForm, domain: e.target.value})}
                        placeholder="e.g., gov.ca, government.org"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Users with emails ending in @domain will be granted government access
                      </p>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDomainDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {domainForm.id ? 'Update' : 'Add'} Domain
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div key={domain.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">@{domain.domain}</div>
                      <div className="text-sm text-muted-foreground">
                        Added {new Date(domain.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editDomain(domain)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {domains.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No allowed domains configured yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}