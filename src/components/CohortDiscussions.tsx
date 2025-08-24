import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Reply, Edit3, Trash2, Send } from 'lucide-react';
import { useCohortDiscussions, type CohortDiscussion } from '@/hooks/useCohortDiscussions';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CohortDiscussionsProps {
  cohortId: string;
}

export function CohortDiscussions({ cohortId }: CohortDiscussionsProps) {
  const { user } = useAuth();
  const { discussions, loading, submitting, createDiscussion, updateDiscussion, deleteDiscussion } = useCohortDiscussions(cohortId);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const handleSubmitMessage = async () => {
    const success = await createDiscussion(newMessage);
    if (success) {
      setNewMessage('');
      toast.success('Message posted successfully');
    } else {
      toast.error('Failed to post message');
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    const success = await createDiscussion(replyMessage, parentId);
    if (success) {
      setReplyMessage('');
      setReplyingTo(null);
      toast.success('Reply posted successfully');
    } else {
      toast.error('Failed to post reply');
    }
  };

  const handleUpdateMessage = async (discussionId: string) => {
    const success = await updateDiscussion(discussionId, editingMessage);
    if (success) {
      setEditingId(null);
      setEditingMessage('');
      toast.success('Message updated successfully');
    } else {
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async (discussionId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    const success = await deleteDiscussion(discussionId);
    if (success) {
      toast.success('Message deleted successfully');
    } else {
      toast.error('Failed to delete message');
    }
  };

  const startEditing = (discussion: CohortDiscussion) => {
    setEditingId(discussion.id);
    setEditingMessage(discussion.message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingMessage('');
  };

  const getUserDisplayName = (discussion: CohortDiscussion) => {
    if (discussion.user?.full_name) {
      return discussion.user.full_name;
    }
    if (discussion.user?.email) {
      return discussion.user.email.split('@')[0];
    }
    return 'Unknown User';
  };

  const getUserInitials = (discussion: CohortDiscussion) => {
    const displayName = getUserDisplayName(discussion);
    return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isOwner = (discussion: CohortDiscussion) => {
    return user?.id === discussion.user_id;
  };

  const DiscussionItem = ({ discussion, isReply = false }: { discussion: CohortDiscussion; isReply?: boolean }) => (
    <div className={`space-y-3 ${isReply ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">
            {getUserInitials(discussion)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{getUserDisplayName(discussion)}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
            </span>
            {discussion.updated_at !== discussion.created_at && (
              <Badge variant="outline" className="text-xs">edited</Badge>
            )}
          </div>
          
          {editingId === discussion.id ? (
            <div className="space-y-2">
              <Textarea
                value={editingMessage}
                onChange={(e) => setEditingMessage(e.target.value)}
                placeholder="Edit your message..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateMessage(discussion.id)}
                  disabled={!editingMessage.trim()}
                >
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{discussion.message}</p>
              
              <div className="flex gap-2">
                {!isReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyingTo(replyingTo === discussion.id ? null : discussion.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
                
                {isOwner(discussion) && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(discussion)}
                      className="h-6 px-2 text-xs"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMessage(discussion.id)}
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
          
          {replyingTo === discussion.id && !isReply && (
            <div className="space-y-2 pt-2 border-t">
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={`Reply to ${getUserDisplayName(discussion)}...`}
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => handleSubmitReply(discussion.id)}
                  disabled={submitting || !replyMessage.trim()}
                >
                  <Send className="w-3 h-3 mr-1" />
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyMessage('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {discussion.replies && discussion.replies.length > 0 && (
            <div className="space-y-3 pt-3">
              {discussion.replies.map((reply) => (
                <DiscussionItem key={reply.id} discussion={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to join the discussion</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Cohort Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New message form */}
        <div className="space-y-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts with the cohort..."
            rows={4}
          />
          <Button 
            onClick={handleSubmitMessage}
            disabled={submitting || !newMessage.trim()}
            className="w-full sm:w-auto"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Posting...' : 'Post Message'}
          </Button>
        </div>

        <Separator />

        {/* Discussions list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-16 bg-muted rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No discussions yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {discussions.map((discussion) => (
              <DiscussionItem key={discussion.id} discussion={discussion} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}