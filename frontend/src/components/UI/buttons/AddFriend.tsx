import React, { useEffect, useState } from 'react';

import { UserMinusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

import { useUser } from '@contexts';

import { cancelsentRequest, sendFriendRequest } from '@services';

interface AddFriendButtonProps {
  receiverUserId: string;
}

const icons = {
  addFriend: <UserPlusIcon className="w-6 h-6" />,
  removeFriend: <UserMinusIcon className="w-6 h-6" />,
};

export const AddFriend: React.FC<AddFriendButtonProps> = ({ receiverUserId }) => {
  const { user, sentRequests, refetchRequests, refetchUser } = useUser();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sentRequests) {
      setIsPending(sentRequests.some((request) => request.receiver_id === receiverUserId));
    }
  }, [sentRequests, receiverUserId, user, loading]);

  const handleAddFriendClick = async () => {
    if (!receiverUserId) return;
    setLoading(true);
    if (isPending) {
      // HANDLE CANCELING FRIEND REQUEST HERE
      await cancelsentRequest(receiverUserId);
      refetchRequests();
      refetchUser();
      setIsPending(false);
      console.log('cancelling friend request');
    } else {
      try {
        await sendFriendRequest(receiverUserId);
        refetchRequests();
        refetchUser();
      } catch (error) {
        console.error('Failed to send friend request:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (sentRequests) {
      setIsPending(sentRequests.some((request) => request.receiver_id === receiverUserId));
    }
  }, [sentRequests, receiverUserId]);

  // console.log(user?.friends);
  // console.log('isPending:', isPending);

  if (user?.friends && user.friends.some((friend) => friend.user_id === receiverUserId))
    return null;

  return (
    <button
      className="hover:text-secondary"
      onClick={(e) => {
        e.stopPropagation();
        handleAddFriendClick();
      }}
      disabled={loading}
      aria-label={`${isPending ? 'delete friend' : 'add friend'}`}
    >
      {isPending ? icons.removeFriend : icons.addFriend}
    </button>
  );
};
