import React, { useEffect, useState } from 'react';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  user: User;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  user,
  selectedFriendId,
  roomId,
}) => {
  // const { messages } = useChatContext();
  const [messageList, setMessageList] = useState<any[]>([]);
  console.log('user: ', user);
  console.log(user.user_id);
  console.log(messages);
  useEffect(() => {
    if (selectedFriendId) {
      setMessageList(messages[selectedFriendId] || []);
    }
    if (roomId) {
      setMessageList(messages[roomId] || []);
    }
  }, [messages, selectedFriendId, roomId]);

  return (
    <div className="flex flex-col overflow-auto w-full h-full max-h-full gap-2 overflow-y-scroll grow p-2 justify-end">
      {messageList.map((msg, i) => (
        <div key={i} className="">
          <MessageBubble
            message={msg}
            isOwn={msg.sender_id === user.user_id}
            sender={msg.sender_id}
          />
        </div>
      ))}
    </div>
  );
};
