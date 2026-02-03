import type { Comment, User } from "@/types/indexTypes";
import { useState, useRef } from "react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {useAddCommentMutation,useGetCommentsByTaskIdQuery} from "@/hooks/useTaskHook";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Loader } from "../ui/loader";

export const CommentSection = ({
  taskId,
  members,
}: {
  taskId: string;
  members: User[];
}) => {
  const [newComment, setNewComment] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: addComment, isPending } = useAddCommentMutation();
  const { data: comments, isLoading } = useGetCommentsByTaskIdQuery(taskId) as {
    data: Comment[];
    isLoading: boolean;
  };
  const renderCommentText = (text: string) => {
    const parts = text.split(/(@[\w\s]+?)(?=\s|$)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="font-semibold">
            {part.substring(1).trim()}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setNewComment(value);
    setCursorPosition(cursorPos);

    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
        
        const filtered = members.filter((member) =>
          member.name.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        setFilteredMembers(filtered);
        setSelectedIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const textAfterCursor = newComment.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    const newText =
      textBeforeCursor.substring(0, lastAtIndex) +
      `@${user.name} ` +
      textAfterCursor;

    setNewComment(newText);
    setShowMentions(false);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastAtIndex + user.name.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && !e.ctrlKey) {
        e.preventDefault();
        insertMention(filteredMembers[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && e.ctrlKey && newComment.trim()) {
      handleAddComment();
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    addComment(
      { taskId, text: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added successfully");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to add comment");
          console.log(error);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Comments</h3>
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Comments</h3>

      <div className="h-75 mb-4 overflow-y-auto scrollbar-visible pr-2">
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.author?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-foreground wrap-break-words">
                    {renderCommentText(comment.text)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No comments yet</p>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-3 relative">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Add a comment..."
            value={newComment}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            className="min-h-20"
          />

          {showMentions && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-full max-w-xs bg-popover border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {filteredMembers.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => insertMention(member)}
                  className={`w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2 ${
                    index === selectedIndex ? "bg-accent" : ""
                  }`}
                >
                  
                  <span className="text-sm">{member.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            disabled={!newComment.trim() || isPending}
            onClick={handleAddComment}
            size="sm"
          >
            {isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
};