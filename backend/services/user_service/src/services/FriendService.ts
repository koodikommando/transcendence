import { Database } from "sqlite";
import { FriendModel } from "../models/FriendModel";
import { NotFoundError, BadRequestError, DatabaseError, NotAuthorizedError, InternalServerError } from '@my-backend/main_server/src/middlewares/errors';
import { request } from "http";


export class FriendService {
    private friendModel: FriendModel;

    constructor(db: Database) {
        this.friendModel = new FriendModel(db);
    }

    async sendFriendRequest(user_id: string, receiver_id: string) {
        return await this.friendModel.runTransaction(async (db) => {
            const requestPair = await this.friendModel.getRequestPairAccepted(user_id, receiver_id);
            if (requestPair) {
                throw new BadRequestError("Friend request already exists");
            }
            const res = await this.friendModel.sendFriendRequest(user_id, receiver_id);
            if (!res) {
                throw new BadRequestError("Could not send friend request");
            }

            return res;
        });
    }

    async getSentFriendRequests(user_id: string) {
        return await this.friendModel.runTransaction(async (db) => {
            const res = await this.friendModel.getSentFriendRequests(user_id);
            if (res.length === 0) {
                throw new NotFoundError("No sent friend requests found");
            }
            return res;
        });
    }

    async getReceivedFriendRequests(user_id: string) {
        return await this.friendModel.runTransaction(async (db) => {
            const res = await this.friendModel.getReceivedFriendRequests(user_id);
            if (res.length === 0) {
                throw new NotFoundError("No received friend requests found");
            }
            return res;
        });
    }

    async acceptFriendRequest(user_id: string, sender_id: string) {
        return await this.friendModel.runTransaction(async (db) => {
            const res = await this.friendModel.acceptFriendRequest(user_id, sender_id);
            if (!res) {
                throw new BadRequestError("Could not accept friend request");
            }
            return res;
        });
    }

    async rejectFriendRequest(user_id: string, sender_id: string) {
        return await this.friendModel.runTransaction(async (db) => {
            const res = await this.friendModel.rejectFriendRequest(user_id, sender_id);
            if (!res) {
                throw new BadRequestError("Could not reject friend request");
            }
            return res;
        });
    }

    async cancelFriendRequest(user_id: string, receiver_id: string) {
        return await this.friendModel.runTransaction(async (db) => {
            const res = await this.friendModel.cancelFriendRequest(user_id, receiver_id);
            if (res.changes === 0) {
                throw new BadRequestError("Could not cancel friend request");
            }
            return res;
        });
    }
}
